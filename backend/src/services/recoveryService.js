import axios from 'axios';
import { config } from '../config.js';

// Ring buffer for actual observed runtime incident & recovery transitions
const MAX_OBSERVED_EVENTS = 50;
const observedRuntimeEvents = [];

// Track previous states to detect actual transitions without simulation
const previousComponentStates = {
  amf: null,
  smf: null,
  upf: null,
  gnb: null,
  ue: null,
};

const recoveryClient = axios.create({
  timeout: 2500,
  headers: {
    'Accept': 'application/json',
    ...(config.recovery.token ? { 'Authorization': `Bearer ${config.recovery.token}` } : {}),
  },
});

export const recoveryService = {
  /**
   * Check if the Restricted Python Recovery API is reachable and fetch active tasks
   */
  async getRecoveryApiStatus() {
    if (!config.recovery.apiUrl) {
      return {
        configured: false,
        connected: false,
        endpoint: null,
        activeRemediations: [],
        historicalAvailable: false,
        historicalNotice: 'Historical recovery data unavailable',
        error: null,
      };
    }

    try {
      const response = await recoveryClient.get(`${config.recovery.apiUrl}/api/status`);
      const data = response.data || {};

      return {
        configured: true,
        connected: true,
        endpoint: config.recovery.apiUrl,
        activeRemediations: Array.isArray(data.activeRemediations) ? data.activeRemediations : [],
        lastEvent: data.lastEvent || null,
        historicalAvailable: !!data.hasHistoricalStorage,
        historicalNotice: data.hasHistoricalStorage ? null : 'Historical recovery data unavailable',
        error: null,
      };
    } catch (err) {
      return {
        configured: true,
        connected: false,
        endpoint: config.recovery.apiUrl,
        activeRemediations: [],
        historicalAvailable: false,
        historicalNotice: 'Historical recovery data unavailable',
        error: err.message || 'Recovery API unreachable',
      };
    }
  },

  /**
   * Fetch historical recovery events if a real persistent store is implemented
   */
  async getHistoricalEvents() {
    if (!config.recovery.apiUrl) {
      return {
        available: false,
        message: 'Historical recovery data unavailable',
        events: [],
      };
    }

    try {
      const response = await recoveryClient.get(`${config.recovery.apiUrl}/api/history`);
      if (Array.isArray(response.data?.events)) {
        return {
          available: true,
          message: null,
          events: response.data.events,
        };
      }
      return {
        available: false,
        message: 'Historical recovery data unavailable',
        events: [],
      };
    } catch {
      return {
        available: false,
        message: 'Historical recovery data unavailable',
        events: [],
      };
    }
  },

  /**
   * Record a real observed state transition event (strictly from live telemetry)
   */
  recordObservedEvent(event) {
    const enriched = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...event,
    };
    observedRuntimeEvents.unshift(enriched);
    if (observedRuntimeEvents.length > MAX_OBSERVED_EVENTS) {
      observedRuntimeEvents.pop();
    }
    return enriched;
  },

  /**
   * Evaluate the complete Live Recovery & Failure state for each component
   * Uses real Prometheus component states, Alertmanager alerts, and recovery bridge evidence.
   */
  async evaluateLiveState(components = {}, activeFiringAlerts = [], interfaces = {}) {
    const timestamp = new Date().toISOString();
    const recoveryApiStatus = await this.getRecoveryApiStatus();
    const activeRemediations = recoveryApiStatus.activeRemediations || [];

    const evaluatedComponents = {};
    const componentKeys = ['amf', 'smf', 'upf', 'gnb', 'ue'];

    // Helper to match firing alerts to a specific 5G component
    const matchAlertForComponent = (key) => {
      return activeFiringAlerts.find(alert => {
        const comp = (alert.component || '').toLowerCase();
        const name = (alert.name || '').toLowerCase();
        const summary = (alert.summary || '').toLowerCase();
        return comp.includes(key) || name.includes(key) || summary.includes(key);
      }) || null;
    };

    // Helper to check if recovery API has an active remediation task for a component
    const matchRemediationForComponent = (key) => {
      return activeRemediations.find(rem => {
        const comp = (rem.component || '').toLowerCase();
        return comp.includes(key);
      }) || null;
    };

    let activeIncidentsCount = 0;

    for (const key of componentKeys) {
      const compData = components[key] || { status: 'Unavailable' };
      const rawStatus = compData.status; // 'UP', 'DOWN', 'Unavailable'
      const matchedAlert = matchAlertForComponent(key);
      const matchedRemediation = matchRemediationForComponent(key);

      let lifecycleState = 'HEALTHY';
      let recoveryState = 'IDLE';
      let recoveryDetails = null;
      let recoveryTimestamp = null;
      let recoveryError = null;
      let endToEndVerified = false;

      // Detect state transitions for actual event log
      const prevState = previousComponentStates[key];
      if (prevState !== null && prevState !== rawStatus) {
        if (rawStatus === 'DOWN') {
          this.recordObservedEvent({
            type: 'FAILURE_DETECTED',
            component: key.toUpperCase(),
            message: `Prometheus scrape detected failure on ${compData.service || key}`,
            alertName: matchedAlert?.name || null,
            severity: matchedAlert?.severity || 'critical',
          });
        } else if (rawStatus === 'UP' && prevState === 'DOWN') {
          this.recordObservedEvent({
            type: 'SERVICE_RESTORED',
            component: key.toUpperCase(),
            message: `Prometheus confirmed service operational for ${compData.service || key}`,
          });
        }
      }
      previousComponentStates[key] = rawStatus;

      // 1. Evaluate Failure State
      if (rawStatus === 'DOWN' || (rawStatus === 'Unavailable' && matchedAlert)) {
        activeIncidentsCount++;

        // Check if there is reliable evidence that recovery has started
        // Rule: "Do not claim recovery has started merely because an alert is firing"
        if (matchedRemediation && matchedRemediation.status === 'IN_PROGRESS') {
          lifecycleState = 'RECOVERING';
          recoveryState = 'RECOVERY_IN_PROGRESS';
          recoveryDetails = matchedRemediation.action || 'Restricted Python Recovery API executing remediation';
          recoveryTimestamp = matchedRemediation.startedAt || timestamp;
        } else if (matchedRemediation && matchedRemediation.status === 'FAILED') {
          lifecycleState = 'RECOVERY_FAILED';
          recoveryState = 'RECOVERY_FAILED';
          recoveryError = matchedRemediation.error || 'Remediation action failed verification';
          recoveryTimestamp = matchedRemediation.failedAt || timestamp;
        } else {
          lifecycleState = 'DOWN';
          recoveryState = 'AWAITING_RECOVERY';
          recoveryDetails = 'Component failure detected by Prometheus; alert firing';
          recoveryTimestamp = matchedAlert?.startsAt || null;
        }
      } else if (rawStatus === 'UP') {
        lifecycleState = 'HEALTHY';

        // Evaluate End-to-End Recovery vs Service Availability
        // Check if relevant interfaces confirm connectivity
        if (key === 'amf') {
          endToEndVerified = interfaces.n2?.status === 'HEALTHY';
          recoveryDetails = endToEndVerified
            ? 'Daemon operational; N2 SCTP socket verified'
            : 'Service active; awaiting N2/Radio association';
        } else if (key === 'smf') {
          endToEndVerified = interfaces.n4?.status === 'HEALTHY';
          recoveryDetails = endToEndVerified
            ? 'Daemon operational; N4 PFCP association active'
            : 'Service active; PFCP session standby';
        } else if (key === 'upf') {
          endToEndVerified = interfaces.n3?.status === 'HEALTHY' || interfaces.n3?.status === 'STANDBY';
          recoveryDetails = endToEndVerified
            ? 'Daemon operational; ogstun user plane interface active'
            : 'Service active; kernel tunnel device pending';
        } else if (key === 'gnb') {
          endToEndVerified = interfaces.n2?.status === 'HEALTHY' && interfaces.uu?.status === 'HEALTHY';
          recoveryDetails = endToEndVerified
            ? 'Radio daemon operational; SCTP link to AMF active'
            : 'Radio daemon operational; awaiting UE attach';
        } else if (key === 'ue') {
          endToEndVerified = interfaces.uu?.status === 'HEALTHY';
          recoveryDetails = endToEndVerified
            ? 'UE registered; 5GMM NAS state active'
            : 'UE operational; awaiting radio registration';
        }
      } else {
        lifecycleState = 'UNAVAILABLE';
        recoveryState = 'NOT_APPLICABLE';
        recoveryDetails = 'Prometheus target unavailable or scrape offline';
      }

      evaluatedComponents[key] = {
        component: key.toUpperCase(),
        service: compData.service || key,
        rawPrometheusStatus: rawStatus,
        lifecycleState, // 'HEALTHY' | 'DOWN' | 'RECOVERING' | 'RECOVERY_FAILED' | 'UNAVAILABLE'
        activeAlert: matchedAlert ? {
          name: matchedAlert.name,
          severity: matchedAlert.severity,
          state: matchedAlert.state,
          startsAt: matchedAlert.startsAt,
          summary: matchedAlert.summary,
        } : null,
        recovery: {
          state: recoveryState, // 'IDLE' | 'AWAITING_RECOVERY' | 'RECOVERY_IN_PROGRESS' | 'RECOVERY_FAILED' | 'NOT_APPLICABLE'
          evidenceAvailable: !!matchedRemediation,
          details: recoveryDetails,
          timestamp: recoveryTimestamp,
          error: recoveryError,
          serviceAvailability: rawStatus === 'UP' ? 'OPERATIONAL' : (rawStatus === 'DOWN' ? 'DOWN' : 'UNAVAILABLE'),
          endToEndVerified,
        },
      };
    }

    return {
      timestamp,
      activeIncidentsCount,
      components: evaluatedComponents,
      recoveryBridgeConnected: recoveryApiStatus.connected,
      recoveryBridgeEndpoint: recoveryApiStatus.endpoint,
      historicalRecoveryAvailable: recoveryApiStatus.historicalAvailable,
      historicalRecoveryNotice: recoveryApiStatus.historicalNotice || 'Historical recovery data unavailable',
      recentObservedEvents: observedRuntimeEvents.slice(0, 10),
    };
  },
};

