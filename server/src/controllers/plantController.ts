import { Request, Response } from 'express';
import { mqttService } from '../services/mqttService';
import { aiService } from '../services/aiService';
import { mlService } from '../services/mlService';
import { dataService } from '../services/dataService';

export const getConfig = (req: Request, res: Response) => {
    res.json({
        success: true,
        config: mqttService.getConfig(),
        status: {
            ml_model_loaded: true, // Simplified
            ai_available: true,
            training_data_samples: dataService.getTrainingQueue().length
        }
    });
};

export const updateConfig = (req: Request, res: Response) => {
    mqttService.updateConfig(req.body);
    res.json({ success: true, config: mqttService.getConfig() });
};

export const getLatestSensor = (req: Request, res: Response) => {
    const data = mqttService.getLatestSensorData();
    const status = mqttService.getStatus();
    res.json({ ...data, pump_status: status.pump_status, auto_mode: status.auto_mode });
};

export const getSensorHistory = (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 100;
    res.json(mqttService.getSensorHistory(limit));
};

export const getStatus = (req: Request, res: Response) => {
    const status = mqttService.getStatus();
    const daysSinceWater = (Date.now() - status.last_watering) / (1000 * 60 * 60 * 24);

    res.json({
        success: true,
        ...status,
        plant_name: mqttService.getConfig().plant_name,
        days_since_watering: daysSinceWater.toFixed(2),
        timestamp: new Date().toISOString()
    });
};

export const runPrediction = async (req: Request, res: Response) => {
    try {
        const { moisture, hour, days_since_water, temperature, air_humidity } = req.body;
        const result = await mlService.predict(
            moisture,
            hour || new Date().getHours(),
            days_since_water || 0,
            temperature || 25,
            air_humidity || 60
        );
        res.json({ success: true, ...result });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getAIAdvice = async (req: Request, res: Response) => {
    try {
        const { moisture, plant_name } = req.body;
        const result = await aiService.runAnalysis(moisture, [], plant_name); // History could be passed if needed
        res.json({ success: true, ...result });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
