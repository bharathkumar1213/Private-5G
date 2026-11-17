import { metricsAggregator } from '../services/metricsAggregator.js';
import { jenkinsService } from '../services/jenkinsService.js';
import { prometheusService } from '../services/prometheusService.js';
import { alertmanagerService } from '../services/alertmanagerService.js';
import { recoveryService } from '../services/recoveryService.js';

export const monitoringController = {
  /**
   * Health endpoint for the Express proxy backend itself
   */
  async getHealth(req, res) {
    res.json({
      status: 'UP',
      service: 'private-5g-monitoring-proxy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * GET /api/overview
   */
  async getOverview(req, res) {
    try {
      const data = await metricsAggregator.getOverview();
      res.json(data);
    } catch (err) {
      res.status(500).json({
        error: 'Failed to aggregate overview metrics',
        message: err.message,
        timestamp: new Date().toISOString(),
      });
    }
  },

  /**
   * GET /api/metrics/live
   */
  async getLiveMetrics(req, res) {
    try {
      const data = await metricsAggregator.getLiveMetrics();
      res.json(data);
    } catch (err) {
      res.status(500).json({
        error: 'Failed to fetch live metrics series',
        message: err.message,
        timestamp: new Date().toISOString(),
      });
    }
  },

  /**
   * GET /api/alerts
   */
  async getAlerts(req, res) {
    try {
      const data = await metricsAggregator.getAlerts();
      res.json(data);
    } catch (err) {
      res.status(500).json({
        error: 'Failed to retrieve alerts',
        message: err.message,
        timestamp: new Date().toISOString(),
      });
    }
  },

  /**
   * GET /api/self-healing
   */
  async getSelfHealing(req, res) {
    try {
      const data = await metricsAggregator.getSelfHealingStatus();
      res.json(data);
    } catch (err) {
      res.status(500).json({
        error: 'Failed to retrieve self-healing status',
        message: err.message,
        timestamp: new Date().toISOString(),
      });
    }
  },

  /**
   * GET /api/jenkins
   */
  async getJenkins(req, res) {
    try {
      const data = await jenkinsService.getStatus();
      res.json(data);
    } catch (err) {
      res.status(500).json({
        error: 'Failed to query Jenkins status',
        message: err.message,
        timestamp: new Date().toISOString(),
      });
    }
  },

  /**
   * GET /api/system
   */
  async getSystemInfo(req, res) {
    try {
      const data = await metricsAggregator.getSystemDiagnostics();
      res.json(data);
    } catch (err) {
      res.status(500).json({
        error: 'Failed to retrieve system diagnostics',
        message: err.message,
        timestamp: new Date().toISOString(),
      });
    }
  },

  /**
   * Direct Prometheus query passthrough (Read-only, sanitized)
   * GET /api/prometheus/query?query=...
   */
  async queryPrometheus(req, res) {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    const result = await prometheusService.queryInstant(query);
    res.json(result);
  },

  /**
   * Direct Alertmanager connectivity test
   * GET /api/alertmanager/status
   */
  async getAlertmanagerStatus(req, res) {
    const result = await alertmanagerService.checkHealth();
    res.json(result);
  },

  /**
   * GET /api/recovery/history
   * Adheres strictly to: "If historical event storage is not implemented, display 'Historical recovery data unavailable'"
   */
  async getRecoveryHistory(req, res) {
    try {
      const data = await recoveryService.getHistoricalEvents();
      res.json(data);
    } catch (err) {
      res.status(500).json({
        available: false,
        message: 'Historical recovery data unavailable',
        events: [],
      });
    }
  },
};

