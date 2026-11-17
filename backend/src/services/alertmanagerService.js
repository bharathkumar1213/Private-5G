import axios from 'axios';
import { config } from '../config.js';

const client = axios.create({
  baseURL: config.alertmanagerUrl,
  timeout: config.timeoutMs,
  headers: {
    'Accept': 'application/json',
  },
});

export const alertmanagerService = {
  /**
   * Check Alertmanager connectivity and status
   */
  async checkHealth() {
    try {
      const startTime = Date.now();
      const response = await client.get('/api/v2/status');
      const latencyMs = Date.now() - startTime;

      return {
        connected: true,
        endpoint: config.alertmanagerUrl,
        latencyMs,
        version: response.data?.versionInfo?.version || 'Unknown',
        uptime: response.data?.uptime || null,
        clusterStatus: response.data?.cluster?.status || 'ready',
        lastChecked: new Date().toISOString(),
        error: null,
      };
    } catch (err) {
      try {
        const startTime = Date.now();
        await client.get('/-/healthy');
        const latencyMs = Date.now() - startTime;
        return {
          connected: true,
          endpoint: config.alertmanagerUrl,
          latencyMs,
          version: 'Active',
          uptime: null,
          clusterStatus: 'ready',
          lastChecked: new Date().toISOString(),
          error: null,
        };
      } catch (fallbackErr) {
        return {
          connected: false,
          endpoint: config.alertmanagerUrl,
          latencyMs: null,
          version: null,
          uptime: null,
          clusterStatus: 'disconnected',
          lastChecked: new Date().toISOString(),
          error: fallbackErr.message || 'Connection refused or timeout',
        };
      }
    }
  },

  /**
   * Fetch active and suppressed alerts from Alertmanager v2 API
   */
  async getAlerts(filterActive = true) {
    try {
      const params = {};
      if (filterActive) {
        params.active = 'true';
        params.silenced = 'false';
        params.inhibited = 'false';
      }
      const response = await client.get('/api/v2/alerts', { params });
      return {
        alerts: Array.isArray(response.data) ? response.data : [],
        error: null,
      };
    } catch (err) {
      return {
        alerts: [],
        error: err.message || 'Alertmanager alerts endpoint unreachable',
      };
    }
  },

  /**
   * Fetch silences if any configured
   */
  async getSilences() {
    try {
      const response = await client.get('/api/v2/silences');
      return {
        silences: Array.isArray(response.data) ? response.data : [],
        error: null,
      };
    } catch (err) {
      return {
        silences: [],
        error: err.message || 'Alertmanager silences endpoint unreachable',
      };
    }
  },
};

