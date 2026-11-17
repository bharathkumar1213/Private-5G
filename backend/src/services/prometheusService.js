import axios from 'axios';
import { config } from '../config.js';

const client = axios.create({
  baseURL: config.prometheusUrl,
  timeout: config.timeoutMs,
  headers: {
    'Accept': 'application/json',
  },
});

export const prometheusService = {
  /**
   * Check Prometheus connectivity and fetch runtime info
   */
  async checkHealth() {
    try {
      const startTime = Date.now();
      const response = await client.get('/api/v1/status/runtimeinfo');
      const latencyMs = Date.now() - startTime;

      return {
        connected: true,
        endpoint: config.prometheusUrl,
        latencyMs,
        version: response.data?.data?.version || 'Unknown',
        reloadConfigSuccess: response.data?.data?.reloadConfigSuccess ?? true,
        lastChecked: new Date().toISOString(),
        error: null,
      };
    } catch (err) {
      // Try fallback to /-/healthy if status API is restricted
      try {
        const startTime = Date.now();
        await client.get('/-/healthy');
        const latencyMs = Date.now() - startTime;
        return {
          connected: true,
          endpoint: config.prometheusUrl,
          latencyMs,
          version: 'Active',
          reloadConfigSuccess: true,
          lastChecked: new Date().toISOString(),
          error: null,
        };
      } catch (fallbackErr) {
        return {
          connected: false,
          endpoint: config.prometheusUrl,
          latencyMs: null,
          version: null,
          reloadConfigSuccess: false,
          lastChecked: new Date().toISOString(),
          error: fallbackErr.message || 'Connection refused or timeout',
        };
      }
    }
  },

  /**
   * Fetch configured targets and their scrape status
   */
  async getTargets() {
    try {
      const response = await client.get('/api/v1/targets');
      if (response.data?.status === 'success') {
        return {
          activeTargets: response.data.data?.activeTargets || [],
          droppedTargets: response.data.data?.droppedTargets || [],
          error: null,
        };
      }
      return { activeTargets: [], droppedTargets: [], error: 'Invalid response from Prometheus' };
    } catch (err) {
      return {
        activeTargets: [],
        droppedTargets: [],
        error: err.message || 'Failed to fetch Prometheus targets',
      };
    }
  },

  /**
   * Execute an instant Prometheus query
   */
  async queryInstant(queryStr) {
    try {
      const response = await client.get('/api/v1/query', {
        params: { query: queryStr },
      });
      if (response.data?.status === 'success') {
        return {
          data: response.data.data,
          error: null,
        };
      }
      return { data: null, error: response.data?.error || 'Query failed' };
    } catch (err) {
      return {
        data: null,
        error: err.response?.data?.error || err.message || 'Query execution error',
      };
    }
  },

  /**
   * Execute a range Prometheus query for time-series charts
   */
  async queryRange(queryStr, startSec, endSec, step = '15s') {
    try {
      const response = await client.get('/api/v1/query_range', {
        params: {
          query: queryStr,
          start: startSec,
          end: endSec,
          step,
        },
      });
      if (response.data?.status === 'success') {
        return {
          data: response.data.data,
          error: null,
        };
      }
      return { data: null, error: response.data?.error || 'Range query failed' };
    } catch (err) {
      return {
        data: null,
        error: err.response?.data?.error || err.message || 'Range query execution error',
      };
    }
  },

  /**
   * Fetch active alerts defined in Prometheus rule groups
   */
  async getAlerts() {
    try {
      const response = await client.get('/api/v1/alerts');
      if (response.data?.status === 'success') {
        return {
          alerts: response.data.data?.alerts || [],
          error: null,
        };
      }
      return { alerts: [], error: 'Failed to retrieve Prometheus alerts' };
    } catch (err) {
      return {
        alerts: [],
        error: err.message || 'Prometheus alerts endpoint unreachable',
      };
    }
  },
};

