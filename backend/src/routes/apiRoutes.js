import { Router } from 'express';
import { monitoringController } from '../controllers/monitoringController.js';

const router = Router();

// Core Dashboard Endpoints
router.get('/health', monitoringController.getHealth);
router.get('/overview', monitoringController.getOverview);
router.get('/metrics/live', monitoringController.getLiveMetrics);
router.get('/alerts', monitoringController.getAlerts);
router.get('/self-healing', monitoringController.getSelfHealing);
router.get('/jenkins', monitoringController.getJenkins);
router.get('/system', monitoringController.getSystemInfo);
router.get('/recovery/history', monitoringController.getRecoveryHistory);

// Read-only diagnostic passthrough
router.get('/prometheus/query', monitoringController.queryPrometheus);
router.get('/alertmanager/status', monitoringController.getAlertmanagerStatus);

export default router;

