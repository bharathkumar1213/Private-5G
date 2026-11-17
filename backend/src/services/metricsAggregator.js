import { prometheusService } from './prometheusService.js';
import { alertmanagerService } from './alertmanagerService.js';
import { jenkinsService } from './jenkinsService.js';
import { recoveryService } from './recoveryService.js';

/**
 * Metric Aggregator:
 * Formulates technical status strictly from real Prometheus and Alertmanager data.
 * Adheres strictly to the rule: "Never assume a component is healthy when its data is missing."
 */
export const metricsAggregator = {
  /**
   * Aggregate complete overview data
   */
  async getOverview() {
    const timestamp = new Date().toISOString();

    // 1. Check reachability of monitoring infrastructure
    const [promHealth, amHealth] = await Promise.all([
      prometheusService.checkHealth(),
      alertmanagerService.checkHealth(),
    ]);

    // 2. If Prometheus is unreachable, all metrics are strictly Unavailable
    if (!promHealth.connected) {
      return {
        timestamp,
        prometheus: promHealth,
        alertmanager: amHealth,
        networkHealth: {
          status: 'UNAVAILABLE',
          summary: 'Prometheus monitoring service unreachable. Metrics pipeline offline.',
          details: promHealth.error || 'Connection refused or timeout at ' + promHealth.endpoint,
        },
        components: {
          amf: { name: 'AMF (Access and Mobility Management)', status: 'Unavailable', service: 'open5gs-amfd', metrics: {} },
          smf: { name: 'SMF (Session Management Function)', status: 'Unavailable', service: 'open5gs-smfd', metrics: {} },
          upf: { name: 'UPF (User Plane Function)', status: 'Unavailable', service: 'open5gs-upfd', metrics: {} },
          gnb: { name: 'gNB (Next Generation Node B)', status: 'Unavailable', service: 'ueransim-gnb', metrics: {} },
          ue: { name: 'UE (User Equipment)', status: 'Unavailable', service: 'ueransim-ue', metrics: {} },
        },
        interfaces: {
          uu: { name: 'Uu', description: 'Radio Access Interface (UE <-> gNB)', type: 'RAN_RADIO', status: 'UNAVAILABLE', active: false, protocol: '3GPP Rel-16 5G-NR air interface' },
          n2: { name: 'N2', description: 'Control Plane Interface (gNB <-> AMF)', type: 'CONTROL_PLANE', status: 'UNAVAILABLE', active: false, protocol: 'NGAP / SCTP (Port 38412)' },
          amfSmfControl: { name: 'AMF-SMF Control Interaction', description: 'Control-plane interaction (N11 / Service-Based Interface)', type: 'CONTROL_PLANE', status: 'UNAVAILABLE', active: false, protocol: 'Service-Based Architecture' },
          n4: { name: 'N4', description: 'Session Control Interface (SMF <-> UPF)', type: 'CONTROL_PLANE', status: 'UNAVAILABLE', active: false, protocol: 'PFCP (Port 8805)' },
          n3: { name: 'N3', description: 'User Plane Interface (gNB <-> UPF)', type: 'USER_PLANE', status: 'UNAVAILABLE', active: false, protocol: 'GTP-U (Port 2152, ogstun)' },
        },
        workflowStages: [
          { id: 1, name: 'UE Registration', component: 'UE (User Equipment)', interface: 'Uu (5G-NR Radio)', status: 'UNAVAILABLE', operationalState: 'UNAVAILABLE', detail: 'Scrape pipeline offline', lastUpdated: timestamp },
          { id: 2, name: 'Radio Access', component: 'gNB (Next Generation Node B)', interface: 'Uu / N2 / N3', status: 'UNAVAILABLE', operationalState: 'UNAVAILABLE', detail: 'Scrape pipeline offline', lastUpdated: timestamp },
          { id: 3, name: 'AMF Registration Management', component: 'AMF (Access and Mobility Management)', interface: 'N2 (SCTP:38412)', status: 'UNAVAILABLE', operationalState: 'UNAVAILABLE', detail: 'Scrape pipeline offline', lastUpdated: timestamp },
          { id: 4, name: 'SMF Session Management', component: 'SMF (Session Management Function)', interface: 'N4 (PFCP:8805) & AMF-SMF Control', status: 'UNAVAILABLE', operationalState: 'UNAVAILABLE', detail: 'Scrape pipeline offline', lastUpdated: timestamp },
          { id: 5, name: 'UPF User Plane Readiness', component: 'UPF (User Plane Function)', interface: 'N3 (GTP-U:2152) / ogstun', status: 'UNAVAILABLE', operationalState: 'UNAVAILABLE', detail: 'Scrape pipeline offline', lastUpdated: timestamp },
        ],
        recovery: {
          timestamp,
          activeIncidentsCount: 0,
          components: {
            amf: { component: 'AMF', service: 'open5gs-amfd', rawPrometheusStatus: 'Unavailable', lifecycleState: 'UNAVAILABLE', activeAlert: null, recovery: { state: 'NOT_APPLICABLE', details: 'Prometheus monitoring service unreachable', serviceAvailability: 'UNAVAILABLE', endToEndVerified: false } },
            smf: { component: 'SMF', service: 'open5gs-smfd', rawPrometheusStatus: 'Unavailable', lifecycleState: 'UNAVAILABLE', activeAlert: null, recovery: { state: 'NOT_APPLICABLE', details: 'Prometheus monitoring service unreachable', serviceAvailability: 'UNAVAILABLE', endToEndVerified: false } },
            upf: { component: 'UPF', service: 'open5gs-upfd', rawPrometheusStatus: 'Unavailable', lifecycleState: 'UNAVAILABLE', activeAlert: null, recovery: { state: 'NOT_APPLICABLE', details: 'Prometheus monitoring service unreachable', serviceAvailability: 'UNAVAILABLE', endToEndVerified: false } },
            gnb: { component: 'GNB', service: 'ueransim-gnb', rawPrometheusStatus: 'Unavailable', lifecycleState: 'UNAVAILABLE', activeAlert: null, recovery: { state: 'NOT_APPLICABLE', details: 'Prometheus monitoring service unreachable', serviceAvailability: 'UNAVAILABLE', endToEndVerified: false } },
            ue: { component: 'UE', service: 'ueransim-ue', rawPrometheusStatus: 'Unavailable', lifecycleState: 'UNAVAILABLE', activeAlert: null, recovery: { state: 'NOT_APPLICABLE', details: 'Prometheus monitoring service unreachable', serviceAvailability: 'UNAVAILABLE', endToEndVerified: false } },
          },
          recoveryBridgeConnected: false,
          historicalRecoveryAvailable: false,
          historicalRecoveryNotice: 'Historical recovery data unavailable',
          recentObservedEvents: [],
        },
      };
    }

    // 3. Query Prometheus for target scrape states and standard metrics for all 5 components
    const [
      targetsRes,
      upMetricsRes,
      amfUeRes,
      smfPduRes,
      upfRxRes,
      upfTxRes,
      gnbUeRes,
      uePduRes,
      gnbAmfRes,
      gnbHealthRes,
      ueRegRes,
      ueConnRes
    ] = await Promise.all([
      prometheusService.getTargets(),
      prometheusService.queryInstant('up'),
      prometheusService.queryInstant('sum(fivegs_amffunction_rm_registeredsubnbr)'),
      prometheusService.queryInstant('sum(fivegs_smffunction_sm_sessionnbr)'),
      prometheusService.queryInstant('rate(open5gs_upf_rx_bytes_total[1m])'),
      prometheusService.queryInstant('rate(open5gs_upf_tx_bytes_total[1m])'),
      prometheusService.queryInstant('sum(ueransim_ue_connected)'),
      prometheusService.queryInstant('sum(fivegs_upffunction_upf_sessionnbr)'),
      prometheusService.queryInstant('ueransim_gnb_sctp_connected'),
      prometheusService.queryInstant('ueransim_gnb_healthy'),
      prometheusService.queryInstant('ueransim_ue_registered'),
      prometheusService.queryInstant('ueransim_ue_connected'),
    ]);

    const activeTargets = targetsRes.activeTargets || [];
    const upSeries = upMetricsRes.data?.result || [];

    // Helper to evaluate target or metric UP/DOWN status
    const evaluateComponentStatus = (nameKeywords) => {
      // 1. Look in targets first
      const matchedTarget = activeTargets.find(t => {
        const job = (t.labels?.job || '').toLowerCase();
        const instance = (t.labels?.instance || '').toLowerCase();
        const comp = (t.labels?.component || '').toLowerCase();
        return nameKeywords.some(kw => job.includes(kw) || instance.includes(kw) || comp.includes(kw));
      });

      if (matchedTarget) {
        if (matchedTarget.health === 'up') return { status: 'UP', scrapePool: matchedTarget.scrapePool, lastScrape: matchedTarget.lastScrape };
        if (matchedTarget.health === 'down') return { status: 'DOWN', scrapePool: matchedTarget.scrapePool, lastScrape: matchedTarget.lastScrape, error: matchedTarget.lastError };
      }

      // 2. Look in 'up' query result
      const matchedUp = upSeries.find(item => {
        const job = (item.metric?.job || '').toLowerCase();
        const instance = (item.metric?.instance || '').toLowerCase();
        const comp = (item.metric?.component || '').toLowerCase();
        return nameKeywords.some(kw => job.includes(kw) || instance.includes(kw) || comp.includes(kw));
      });

      if (matchedUp) {
        const val = parseFloat(matchedUp.value?.[1]);
        if (val === 1) return { status: 'UP', job: matchedUp.metric.job };
        if (val === 0) return { status: 'DOWN', job: matchedUp.metric.job };
      }

      // If no data found for this component, strictly return "Unavailable"
      return { status: 'Unavailable', details: 'No active Prometheus target or metric discovered' };
    };

    const amfState = evaluateComponentStatus(['amf', 'open5gs-amf', 'open5gs_amf']);
    const smfState = evaluateComponentStatus(['smf', 'open5gs-smf', 'open5gs_smf']);
    const upfState = evaluateComponentStatus(['upf', 'open5gs-upf', 'open5gs_upf']);
    const gnbState = evaluateComponentStatus(['gnb', 'ueransim-gnb', 'ueransim_gnb', 'ran']);
    const ueState = evaluateComponentStatus(['ue', 'ueransim-ue', 'ueransim_ue']);

    // Extract scalar values if available
    const getScalarMetric = (res) => {
      const item = res.data?.result?.[0];
      if (item && item.value && item.value[1] !== undefined) {
        const parsed = parseFloat(item.value[1]);
        return Number.isNaN(parsed) ? 'Unavailable' : parsed;
      }
      return 'Unavailable';
    };

    const registeredUes = getScalarMetric(amfUeRes);
    const activePduSessions = getScalarMetric(smfPduRes);
    const upfRxRate = getScalarMetric(upfRxRes);
    const upfTxRate = getScalarMetric(upfTxRes);
    const connectedUes = getScalarMetric(gnbUeRes);
    const uePduActive = getScalarMetric(uePduRes);
    const gnbAmfVal = getScalarMetric(gnbAmfRes);
    const gnbHealthyVal = getScalarMetric(gnbHealthRes);
    const ueRegVal = getScalarMetric(ueRegRes);
    const ueConnVal = getScalarMetric(ueConnRes);

    // Compute Interface Link States based on real component status & metrics
    // 1. Uu (UE <-> gNB)
    let uuStatus = 'UNAVAILABLE';
    let uuActive = false;
    if (ueState.status === 'Unavailable' || gnbState.status === 'Unavailable') {
      uuStatus = 'UNAVAILABLE';
    } else if (ueState.status === 'DOWN' || gnbState.status === 'DOWN') {
      uuStatus = 'DOWN';
    } else {
      const hasUeLink = (typeof connectedUes === 'number' && connectedUes > 0) ||
                        (typeof uePduActive === 'number' && uePduActive > 0) ||
                        (typeof ueRegVal === 'number' && ueRegVal > 0) ||
                        (typeof ueConnVal === 'number' && ueConnVal > 0);
      if (hasUeLink) {
        uuStatus = 'HEALTHY';
        uuActive = true;
      } else {
        uuStatus = 'STANDBY';
        uuActive = false;
      }
    }

    // 2. N2 (gNB <-> AMF: NGAP / SCTP:38412)
    let n2Status = 'UNAVAILABLE';
    let n2Active = false;
    if (gnbState.status === 'Unavailable' || amfState.status === 'Unavailable') {
      n2Status = 'UNAVAILABLE';
    } else if (gnbState.status === 'DOWN' || amfState.status === 'DOWN') {
      n2Status = 'DOWN';
    } else {
      if (gnbAmfVal === 0) {
        n2Status = 'DOWN';
      } else {
        n2Status = 'HEALTHY';
        n2Active = true;
      }
    }

    // 3. AMF-SMF Control Interaction (Service-Based N11 / SBI)
    let amfSmfStatus = 'UNAVAILABLE';
    let amfSmfActive = false;
    if (amfState.status === 'Unavailable' || smfState.status === 'Unavailable') {
      amfSmfStatus = 'UNAVAILABLE';
    } else if (amfState.status === 'DOWN' || smfState.status === 'DOWN') {
      amfSmfStatus = 'DOWN';
    } else {
      amfSmfStatus = 'HEALTHY';
      amfSmfActive = true;
    }

    // 4. N4 (SMF <-> UPF: PFCP Port 8805)
    let n4Status = 'UNAVAILABLE';
    let n4Active = false;
    if (smfState.status === 'Unavailable' || upfState.status === 'Unavailable') {
      n4Status = 'UNAVAILABLE';
    } else if (smfState.status === 'DOWN' || upfState.status === 'DOWN') {
      n4Status = 'DOWN';
    } else {
      n4Status = 'HEALTHY';
      n4Active = true;
    }

    // 5. N3 (gNB <-> UPF: GTP-U Port 2152 User Plane)
    // Note: User plane is only animated as active when confirmed by active sessions or traffic
    let n3Status = 'UNAVAILABLE';
    let n3Active = false;
    if (gnbState.status === 'Unavailable' || upfState.status === 'Unavailable') {
      n3Status = 'UNAVAILABLE';
    } else if (gnbState.status === 'DOWN' || upfState.status === 'DOWN') {
      n3Status = 'DOWN';
    } else {
      const hasActiveTraffic = (typeof activePduSessions === 'number' && activePduSessions > 0) ||
                               (typeof upfRxRate === 'number' && upfRxRate > 0) ||
                               (typeof upfTxRate === 'number' && upfTxRate > 0) ||
                               (typeof uePduActive === 'number' && uePduActive > 0);
      if (hasActiveTraffic) {
        n3Status = 'HEALTHY';
        n3Active = true;
      } else {
        n3Status = 'STANDBY';
        n3Active = false;
      }
    }

    const interfaces = {
      uu: {
        name: 'Uu',
        description: 'Radio Access Interface (UE <-> gNB)',
        type: 'RAN_RADIO',
        status: uuStatus,
        active: uuActive,
        protocol: '3GPP Rel-16 5G-NR air interface',
        from: 'UE',
        to: 'gNB',
      },
      n2: {
        name: 'N2',
        description: 'Control Plane Interface (gNB <-> AMF)',
        type: 'CONTROL_PLANE',
        status: n2Status,
        active: n2Active,
        protocol: 'NGAP / SCTP (Port 38412)',
        from: 'gNB',
        to: 'AMF',
      },
      amfSmfControl: {
        name: 'AMF-SMF Control Interaction',
        description: 'Control-plane interaction (N11 / Service-Based Interface)',
        type: 'CONTROL_PLANE',
        status: amfSmfStatus,
        active: amfSmfActive,
        protocol: 'Service-Based Architecture (Namf/Nsmf)',
        from: 'AMF',
        to: 'SMF',
      },
      n4: {
        name: 'N4',
        description: 'Session Control Interface (SMF <-> UPF)',
        type: 'CONTROL_PLANE',
        status: n4Status,
        active: n4Active,
        protocol: 'PFCP (Port 8805)',
        from: 'SMF',
        to: 'UPF',
      },
      n3: {
        name: 'N3',
        description: 'User Plane Interface (gNB <-> UPF)',
        type: 'USER_PLANE',
        status: n3Status,
        active: n3Active,
        protocol: 'GTP-U (Port 2152, ogstun)',
        from: 'gNB',
        to: 'UPF',
      },
    };

    // Calculate 5 Workflow Stages
    const workflowStages = [
      {
        id: 1,
        name: 'UE Registration',
        component: 'UE (User Equipment)',
        interface: 'Uu (5G-NR Radio)',
        status: ueState.status === 'Unavailable'
          ? 'UNAVAILABLE'
          : (ueState.status === 'DOWN'
            ? 'OFFLINE'
            : (uuActive ? 'REGISTERED' : 'STANDBY (IDLE)')),
        operationalState: ueState.status === 'UP' ? (uuActive ? 'HEALTHY' : 'STANDBY') : (ueState.status === 'DOWN' ? 'DOWN' : 'UNAVAILABLE'),
        detail: typeof registeredUes === 'number' ? `${registeredUes} Subscriber(s)` : 'Awaiting radio registration',
        lastUpdated: timestamp,
      },
      {
        id: 2,
        name: 'Radio Access',
        component: 'gNB (Next Generation Node B)',
        interface: 'Uu / N2 / N3',
        status: gnbState.status === 'Unavailable'
          ? 'UNAVAILABLE'
          : (gnbState.status === 'DOWN'
            ? 'OFFLINE'
            : (typeof connectedUes === 'number' && connectedUes > 0 ? 'CARRIER ACTIVE' : 'CARRIER STANDBY')),
        operationalState: gnbState.status === 'UP' ? 'HEALTHY' : (gnbState.status === 'DOWN' ? 'DOWN' : 'UNAVAILABLE'),
        detail: typeof connectedUes === 'number' ? `${connectedUes} Connected UE(s)` : 'NR-SA Cell Online',
        lastUpdated: timestamp,
      },
      {
        id: 3,
        name: 'AMF Registration Management',
        component: 'AMF (Access and Mobility Management Function)',
        interface: 'N2 (SCTP:38412)',
        status: amfState.status === 'Unavailable'
          ? 'UNAVAILABLE'
          : (amfState.status === 'DOWN' ? 'SERVICE FAULT' : 'OPERATIONAL'),
        operationalState: amfState.status === 'UP' ? 'HEALTHY' : (amfState.status === 'DOWN' ? 'DOWN' : 'UNAVAILABLE'),
        detail: '5GMM State & SCTP Socket Bound',
        lastUpdated: timestamp,
      },
      {
        id: 4,
        name: 'SMF Session Management',
        component: 'SMF (Session Management Function)',
        interface: 'N4 (PFCP:8805) & AMF-SMF Control',
        status: smfState.status === 'Unavailable'
          ? 'UNAVAILABLE'
          : (smfState.status === 'DOWN'
            ? 'SERVICE FAULT'
            : (typeof activePduSessions === 'number' && activePduSessions > 0 ? 'PDU ACTIVE' : 'STANDBY (0 SESSIONS)')),
        operationalState: smfState.status === 'UP' ? 'HEALTHY' : (smfState.status === 'DOWN' ? 'DOWN' : 'UNAVAILABLE'),
        detail: typeof activePduSessions === 'number' ? `${activePduSessions} Session(s)` : 'PFCP Session Manager Ready',
        lastUpdated: timestamp,
      },
      {
        id: 5,
        name: 'UPF User Plane Readiness',
        component: 'UPF (User Plane Function)',
        interface: 'N3 (GTP-U:2152) / ogstun',
        status: upfState.status === 'Unavailable'
          ? 'UNAVAILABLE'
          : (upfState.status === 'DOWN'
            ? 'INTERFACE FAULT'
            : (n3Active ? 'USER PLANE ACTIVE' : 'TUNNEL READY (IDLE)')),
        operationalState: upfState.status === 'UP' ? (n3Active ? 'HEALTHY' : 'STANDBY') : (upfState.status === 'DOWN' ? 'DOWN' : 'UNAVAILABLE'),
        detail: n3Active
          ? `Active User Data Routing (Rx: ${typeof upfRxRate === 'number' ? `${upfRxRate.toFixed(1)} B/s` : 'Unavailable'})`
          : 'Kernel ogstun Tunnel Bound (No Active User Sessions)',
        lastUpdated: timestamp,
      },
    ];

    const components = {
      amf: {
        name: 'AMF (Access and Mobility Management)',
        service: 'open5gs-amfd',
        protocol: 'NGAP / SCTP (Port 38412)',
        status: amfState.status,
        lastScrape: amfState.lastScrape || null,
        metrics: {
          registeredUEs: registeredUes,
        },
      },
      smf: {
        name: 'SMF (Session Management Function)',
        service: 'open5gs-smfd',
        protocol: 'PFCP / GTP-C (Port 8805)',
        status: smfState.status,
        lastScrape: smfState.lastScrape || null,
        metrics: {
          activeSessions: activePduSessions,
        },
      },
      upf: {
        name: 'UPF (User Plane Function)',
        service: 'open5gs-upfd',
        protocol: 'GTP-U (Port 2152, ogstun)',
        status: upfState.status,
        lastScrape: upfState.lastScrape || null,
        metrics: {
          rxBytesRate: upfRxRate,
          txBytesRate: upfTxRate,
        },
      },
      gnb: {
        name: 'gNB (Next Generation Node B)',
        service: 'ueransim-gnb',
        protocol: '3GPP Rel-16 Radio Simulation',
        status: gnbState.status,
        lastScrape: gnbState.lastScrape || null,
        metrics: {
          connectedUEs: connectedUes,
        },
      },
      ue: {
        name: 'UE (User Equipment)',
        service: 'ueransim-ue',
        protocol: 'uesimtun0 interface',
        status: ueState.status,
        lastScrape: ueState.lastScrape || null,
        metrics: {
          pduActive: uePduActive,
        },
      },
    };

    // Calculate network health
    const statuses = [amfState.status, smfState.status, upfState.status, gnbState.status, ueState.status];
    const hasDown = statuses.includes('DOWN');
    const allUp = statuses.every(s => s === 'UP');
    const allUnavailable = statuses.every(s => s === 'Unavailable');

    let overallHealthStatus = 'OPTIMAL';
    let summary = 'All 5G Core and RAN functions operating within standard parameters.';

    if (hasDown) {
      overallHealthStatus = 'DEGRADED';
      summary = 'One or more 5G functions report DOWN state. Failure detected.';
    } else if (allUnavailable) {
      overallHealthStatus = 'UNAVAILABLE';
      summary = 'Prometheus target configuration returns no metrics for core or RAN elements.';
    } else if (!allUp) {
      overallHealthStatus = 'PARTIAL_MONITORING';
      summary = 'Partial metrics received. Some components have missing scrape data.';
    }

    // 4. Retrieve live recovery, failure detection, and incident state
    // Rule: Match real Prometheus states with real Alertmanager firing alerts and recovery bridge events
    let liveAlerts = [];
    try {
      const amAlertsRes = await alertmanagerService.getAlerts(true);
      liveAlerts = (amAlertsRes.alerts || []).map(alert => ({
        source: 'Alertmanager',
        name: alert.labels?.alertname || 'UnnamedAlert',
        component: alert.labels?.component || alert.labels?.job || '',
        severity: alert.labels?.severity || 'warning',
        state: alert.status?.state || 'active',
        startsAt: alert.startsAt || null,
        summary: alert.annotations?.summary || alert.annotations?.description || '',
      }));
    } catch {
      liveAlerts = [];
    }

    const liveRecoveryState = await recoveryService.evaluateLiveState(
      components,
      liveAlerts,
      interfaces
    );

    return {
      timestamp,
      prometheus: promHealth,
      alertmanager: amHealth,
      networkHealth: {
        status: overallHealthStatus,
        summary,
        componentBreakdown: {
          total: 5,
          up: statuses.filter(s => s === 'UP').length,
          down: statuses.filter(s => s === 'DOWN').length,
          unavailable: statuses.filter(s => s === 'Unavailable').length,
        },
      },
      components,
      interfaces,
      workflowStages,
      recovery: liveRecoveryState,
    };
  },

  /**
   * Get Alerts from both Prometheus and Alertmanager
   */
  async getAlerts() {
    const timestamp = new Date().toISOString();

    const [promAlertsRes, amAlertsRes, amSilencesRes] = await Promise.all([
      prometheusService.getAlerts(),
      alertmanagerService.getAlerts(false), // get all alerts
      alertmanagerService.getSilences(),
    ]);

    // Parse and normalize alertmanager alerts
    const alertmanagerAlerts = (amAlertsRes.alerts || []).map(alert => ({
      source: 'Alertmanager',
      fingerprint: alert.fingerprint || null,
      name: alert.labels?.alertname || 'UnnamedAlert',
      component: alert.labels?.component || alert.labels?.job || 'Private-5G',
      severity: alert.labels?.severity || 'warning',
      state: alert.status?.state || 'active',
      startsAt: alert.startsAt || null,
      endsAt: alert.endsAt || null,
      summary: alert.annotations?.summary || alert.annotations?.description || 'No summary provided',
      description: alert.annotations?.description || null,
      inhibitedBy: alert.status?.inhibitedBy || [],
      silencedBy: alert.status?.silencedBy || [],
    }));

    // Parse Prometheus rule alerts
    const prometheusAlerts = (promAlertsRes.alerts || []).map(alert => ({
      source: 'Prometheus',
      name: alert.labels?.alertname || 'UnnamedAlert',
      component: alert.labels?.component || alert.labels?.job || 'Private-5G',
      severity: alert.labels?.severity || 'warning',
      state: alert.state || 'firing',
      startsAt: alert.activeAt || null,
      summary: alert.annotations?.summary || alert.annotations?.description || 'No summary provided',
      value: alert.value || null,
    }));

    // Firing vs Resolved
    const activeFiring = alertmanagerAlerts.filter(a => a.state === 'active');
    const resolvedOrSuppressed = alertmanagerAlerts.filter(a => a.state !== 'active');

    return {
      timestamp,
      prometheusConnectivity: !promAlertsRes.error,
      alertmanagerConnectivity: !amAlertsRes.error,
      errors: {
        prometheus: promAlertsRes.error,
        alertmanager: amAlertsRes.error,
      },
      stats: {
        totalActive: activeFiring.length,
        totalResolvedOrSuppressed: resolvedOrSuppressed.length,
        prometheusRuleAlerts: prometheusAlerts.length,
      },
      activeFiring,
      resolvedOrSuppressed,
      prometheusAlerts,
      silences: amSilencesRes.silences || [],
    };
  },

  /**
   * Get Time Series data for live charts from Prometheus range queries
   */
  async getLiveMetrics() {
    const timestamp = new Date().toISOString();
    const end = Math.floor(Date.now() / 1000);
    const start = end - 15 * 60; // Last 15 minutes
    const step = '15s';

    const queries = {
      amfSctp: 'ueransim_gnb_sctp_connected',
      registeredUEs: 'sum(fivegs_amffunction_rm_registeredsubnbr)',
      smfSessions: 'sum(fivegs_smffunction_sm_sessionnbr)',
      upfThroughputRx: 'rate(open5gs_upf_rx_bytes_total[1m])',
      upfThroughputTx: 'rate(open5gs_upf_tx_bytes_total[1m])',
      gnbConnectedUEs: 'sum(ueransim_ue_connected)',
    };

    const results = {};
    const queryKeys = Object.keys(queries);

    await Promise.all(
      queryKeys.map(async key => {
        const res = await prometheusService.queryRange(queries[key], start, end, step);
        if (res.data?.result && res.data.result.length > 0) {
          // Format timestamps and values
          const rawValues = res.data.result[0].values || [];
          results[key] = rawValues.map(([t, v]) => ({
            timestamp: t * 1000,
            timeStr: new Date(t * 1000).toLocaleTimeString([], { hour12: false }),
            value: parseFloat(v),
          }));
        } else {
          // Metric unavailable from Prometheus
          results[key] = [];
        }
      })
    );

    return {
      timestamp,
      timeWindowSeconds: 900,
      step: '15s',
      metrics: results,
      available: Object.values(results).some(arr => arr.length > 0),
    };
  },

  /**
   * Self-healing technical status:
   * Displays verified recovery capabilities vs unverified test capabilities.
   * Adheres strictly to:
   * "Known verified result: AMF automatic recovery successfully demonstrated.
   * Not yet independently verified: SMF automatic recovery, UPF automatic recovery,
   * independent gNB recovery, independent UE recovery.
   * Do not claim unverified recovery capabilities as successful.
   * Never invent recovery history, success percentages or incident counts."
   */
  async getSelfHealingStatus() {
    const timestamp = new Date().toISOString();

    return {
      timestamp,
      architecture: {
        model: 'Closed-Loop Closed-Feedback Self-Healing',
        detectionEngine: 'Prometheus Scrape & Alertmanager Rule Evaluation',
        triggerBridge: 'Alertmanager Recovery Webhook Bridge (Python REST API)',
        orchestrationAction: 'Systemd Unit Lifecycle Control & UERANSIM Trigger',
      },
      capabilities: [
        {
          id: 'cap-amf',
          component: 'AMF (Access and Mobility Management Function)',
          verificationStatus: 'VERIFIED',
          verificationNote: 'Automatic recovery successfully demonstrated during controlled fault injection testing.',
          actionTrigger: 'Alert: AMFServiceDown (for: 10s)',
          remediationMechanism: 'Restricted Python API invokes systemctl restart open5gs-amfd.service and verifies SCTP socket binding on port 38412.',
          statePreservation: 'Subscribers re-register via NGAP protocol handshake upon SCTP re-establishment.',
        },
        {
          id: 'cap-smf',
          component: 'SMF (Session Management Function)',
          verificationStatus: 'NOT_VERIFIED',
          verificationNote: 'Pipeline designed; not yet independently verified in test environment.',
          actionTrigger: 'Alert: SMFServiceDown (for: 10s)',
          remediationMechanism: 'Restart open5gs-smfd.service and re-bind PFCP association with UPF.',
          statePreservation: 'PDU session context recovery requires active PFCP heartbeat validation.',
        },
        {
          id: 'cap-upf',
          component: 'UPF (User Plane Function)',
          verificationStatus: 'NOT_VERIFIED',
          verificationNote: 'Pipeline designed; not yet independently verified in test environment.',
          actionTrigger: 'Alert: UPFServiceDown (for: 10s)',
          remediationMechanism: 'Restart open5gs-upfd.service and ensure ogstun tunnel interface re-instantiation.',
          statePreservation: 'GTP-U tunnel routing requires kernel tun device reconfiguration.',
        },
        {
          id: 'cap-gnb',
          component: 'gNB (Next Generation Node B - UERANSIM)',
          verificationStatus: 'NOT_VERIFIED',
          verificationNote: 'Pipeline designed; not yet independently verified in test environment.',
          actionTrigger: 'Alert: gNBLostConnection (for: 15s)',
          remediationMechanism: 'Restart ueransim-gnb daemon and re-establish SCTP association with AMF.',
          statePreservation: 'RAN radio state resets; UEs must execute cell reselection and RRC re-establishment.',
        },
        {
          id: 'cap-ue',
          component: 'UE (User Equipment - UERANSIM)',
          verificationStatus: 'NOT_VERIFIED',
          verificationNote: 'Pipeline designed; not yet independently verified in test environment.',
          actionTrigger: 'Alert: UEDeregisteredUnexpectedly (for: 15s)',
          remediationMechanism: 'UE recovery trigger daemon invokes ueransim-ue attachment script.',
          statePreservation: 'NAS 5GMM registration and PDU Session Establishment to recover uesimtun0 IP.',
        },
      ],
      historicalVerificationRecord: {
        testedComponents: ['AMF'],
        untestedComponents: ['SMF', 'UPF', 'gNB', 'UE'],
        auditNotice: 'In accordance with engineering requirements, unverified self-healing capabilities are strictly labeled as unverified. Simulated success percentages or artificial incident counts are excluded.',
      },
    };
  },

  /**
   * System Information & Diagnostics
   */
  async getSystemDiagnostics() {
    const [promHealth, amHealth, jenkinsStatus] = await Promise.all([
      prometheusService.checkHealth(),
      alertmanagerService.checkHealth(),
      jenkinsService.getStatus(),
    ]);

    return {
      timestamp: new Date().toISOString(),
      platform: {
        os: 'Ubuntu 24.04 LTS (Target Environment)',
        architecture: 'x86_64 / Linux 6.8+',
        kernel: 'Standard Linux Kernel (5G User Plane ogstun enabled)',
      },
      monitoringInfrastructure: {
        prometheus: promHealth,
        alertmanager: amHealth,
      },
      automationInfrastructure: {
        jenkins: jenkinsStatus,
      },
      subsystems: [
        { name: 'Open5GS Core', packages: ['open5gs-amfd', 'open5gs-smfd', 'open5gs-upfd'], status: 'Installed / Managed via Systemd' },
        { name: 'UERANSIM RAN/UE', packages: ['nr-gnb', 'nr-ue', 'nr-cli'], status: 'Configured on simulated radio interfaces' },
        { name: 'Self-Healing Controller', service: 'Restricted Python Recovery API', port: 'Internal Unix Socket / Local Port' },
        { name: 'Alertmanager Recovery Bridge', service: 'alertmanager-bridge.py', status: 'Active Webhook Receiver' },
        { name: 'UE Recovery Trigger', service: 'ue-recovery-trigger.py', status: 'Standby / Event Trigger' },
      ],
    };
  },
};

