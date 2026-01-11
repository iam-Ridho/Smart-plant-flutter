import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
    PORT: process.env.PORT || 3000,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'AIzaSyCZqWhWsaboHNn0xgfP0DN4VVHDhN9PvPU',
    MQTT: {
        BROKER_URL: process.env.MQTT_BROKER_URL || 'mqtts://f6c3bd764c054b5089d29b5a566ebaa1.s1.eu.hivemq.cloud:8883',
        USERNAME: process.env.MQTT_USERNAME || 'ridho',
        PASSWORD: process.env.MQTT_PASSWORD || 'Ridho123.',
        PORT: parseInt(process.env.MQTT_PORT || '8883'),
    },
    PATHS: {
        MODELS: path.join(__dirname, '../../models'),
        TRAINING_DATA: path.join(__dirname, '../../ai_training_data.csv'),
        LAST_WATERING: path.join(__dirname, '../../last_watering.json'),
        SCALER_PARAMS: path.join(__dirname, '../../scaler_params.json'),
        PYTHON_SCRIPT: path.join(__dirname, '../../retrain_model.py'),
    }
};

export const defaultSystemConfig = {
    ml_auto_predict: true,
    ai_auto_analysis: false,
    ai_analysis_interval: 1800000, // 30 menit
    ai_analysis_threshold: 20,
    plant_name: '',
    ai_to_ml_feedback: true,
    auto_export_training_data: true,
    auto_retrain_enabled: true,
    auto_retrain_min_samples: 100,
    auto_retrain_schedule: '0 2 * * *' // Jam 2 pagi
};
