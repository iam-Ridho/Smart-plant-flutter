import { Router } from 'express';
import * as plantController from '../controllers/plantController';

const router = Router();

// Config Routes
router.get('/config', plantController.getConfig);
router.post('/config', plantController.updateConfig);

// Sensor & Status Routes
router.get('/sensor/latest', plantController.getLatestSensor);
router.get('/sensor/history', plantController.getSensorHistory);
router.get('/status', plantController.getStatus);

// Logic Routes
router.post('/ml/predict', plantController.runPrediction);
router.post('/ai/advice', plantController.getAIAdvice);

// Health Check
router.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

export default router;
