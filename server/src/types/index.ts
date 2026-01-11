export interface SystemConfig {
    ml_auto_predict: boolean;
    ai_auto_analysis: boolean;
    ai_analysis_interval: number;
    ai_analysis_threshold: number;
    plant_name: string;
    ai_to_ml_feedback: boolean;
    auto_export_training_data: boolean;
    auto_retrain_enabled: boolean;
    auto_retrain_min_samples: number;
    auto_retrain_schedule: string;
}

export interface SensorData {
    timestamp?: string;
    moisture: number;
    temperature: number;
    air_humidity: number;
    pump_status?: string;
    auto_mode?: boolean;
    pump?: string;
    auto?: boolean;
}

export interface MLPrediction {
    score: number;
    needs_water: boolean;
    confidence: number;
    features: {
        moisture: number;
        hour: number;
        daysSinceWater: number;
        temperature: number;
        airHumidity: number;
    };
    method?: string;
    ai_adjusted?: boolean;
    ml_prediction?: any;
    ai_assessment?: any;
    timestamp?: string;
    auto?: boolean;
}

export interface AIAnalysisResult {
    plant_name: string;
    plant_identified?: string;
    recommendation?: string;
    watering_schedule?: string;
    moisture_analysis?: string;
    optimal_moisture_range?: string;
    tips?: string[];
    health_status?: string;
    urgent_action?: string | null;
    sunlight_needs?: string;
    ideal_temperature?: string;
    generated_at?: string;
    moisture?: number;
    auto?: boolean;
    success?: boolean;
}

export interface TrainingDataRow {
    moisture: number;
    hour: number;
    days_since_water: number;
    temperature: number;
    air_humidity: number;
    needs_water: number;
    source?: string;
    plant_name?: string;
    ai_confidence?: string;
    timestamp?: string;
}


