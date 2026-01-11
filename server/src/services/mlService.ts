import * as tf from '@tensorflow/tfjs';
import fs from 'fs';
import path from 'path';
import { config } from '../config/config';
import { MLPrediction, AIAnalysisResult } from '../types';

export class MLService {
    private model: any | null = null;
    private scalerParams: any = null;
    private predictions: MLPrediction[] = [];

    constructor() {
        // Model loading is async, called explicitly
    }

    public async loadModel(): Promise<boolean> {
        try {
            // Check if model file exists physically
            const modelJsonPath = path.join(config.PATHS.MODELS, 'plant-model', 'model.json');
            if (!fs.existsSync(modelJsonPath)) {
                console.warn('⚠️  Model file not found at', modelJsonPath);
                return false;
            }

            // Load model using HTTP (served statically by server.ts)
            // This avoids tfjs-node binary dependency issues
            const modelUrl = `http://localhost:${config.PORT}/models/plant-model/model.json`;
            console.log('🔄 Loading ML model from:', modelUrl);

            if (this.model) {
                this.model.dispose();
            }

            this.model = await tf.loadLayersModel(modelUrl);
            console.log('✅ ML Model loaded successfully');

            this.loadScalerParams();
            return true;
        } catch (error: any) {
            console.error('❌ Model loading failed:', error.message);
            return false;
        }
    }

    private loadScalerParams() {
        if (fs.existsSync(config.PATHS.SCALER_PARAMS)) {
            this.scalerParams = JSON.parse(fs.readFileSync(config.PATHS.SCALER_PARAMS, 'utf8'));
            console.log('✅ Scaler parameters loaded');
        } else {
            this.scalerParams = {
                mean: [50.0, 11.5, 3.5, 25.0, 60.0],
                scale: [28.87, 6.93, 2.02, 5.77, 17.32]
            };
        }
    }

    private normalizeFeatures(features: number[]): number[] {
        if (!this.scalerParams) return features;
        return features.map((val, idx) => (val - this.scalerParams.mean[idx]) / this.scalerParams.scale[idx]);
    }

    public async predict(moisture: number, hour: number, daysSinceWater: number, temperature: number, airHumidity: number): Promise<MLPrediction> {
        if (!this.model || !this.scalerParams) {
            throw new Error('ML model not loaded');
        }

        const features = [moisture, hour, daysSinceWater, temperature, airHumidity];
        const normalized = this.normalizeFeatures(features);

        try {
            const inputTensor = tf.tensor2d([normalized]);
            const predictionTensor = this.model.predict(inputTensor) as any;
            const data = await predictionTensor.data();
            const score = data[0];

            inputTensor.dispose();
            predictionTensor.dispose();

            const result: MLPrediction = {
                score: score,
                needs_water: score > 0.5,
                confidence: score * 100,
                features: { moisture, hour, daysSinceWater, temperature, airHumidity }
            };

            this.predictions.push({ ...result, timestamp: new Date().toISOString() });
            if (this.predictions.length > 100) this.predictions.shift();

            return result;
        } catch (error) {
            console.error('❌ Prediction error:', error);
            throw error;
        }
    }

    public async hybridPrediction(
        moisture: number,
        hour: number,
        daysSinceWater: number,
        temperature: number,
        airHumidity: number,
        aiAnalysis: AIAnalysisResult | null
    ): Promise<MLPrediction> {
        const mlPrediction = await this.predict(moisture, hour, daysSinceWater, temperature, airHumidity);

        if (!aiAnalysis) {
            return {
                ...mlPrediction,
                method: 'ml_only',
                ai_adjusted: false
            };
        }

        // Logic Hybrid sama seperti server.js
        let aiNeedsWater = false;
        let aiConfidence = 0.5;

        const urgentAction = aiAnalysis.urgent_action?.toLowerCase() || '';
        const recommendation = aiAnalysis.recommendation?.toLowerCase() || '';
        const healthStatus = aiAnalysis.health_status?.toLowerCase() || '';

        if (urgentAction && urgentAction !== 'null') {
            aiNeedsWater = true;
            aiConfidence = 0.9;
        } else if (recommendation.includes('siram') || recommendation.includes('water')) {
            aiNeedsWater = true;
            aiConfidence = 0.75;
        } else if (healthStatus.includes('buruk')) {
            aiNeedsWater = true;
            aiConfidence = 0.7;
        } else if (healthStatus.includes('baik')) {
            aiNeedsWater = false;
            aiConfidence = 0.6;
        }

        const mlWeight = 0.7;
        const aiWeight = 0.3;
        const mlScore = mlPrediction.score;
        const aiScore = aiNeedsWater ? aiConfidence : (1 - aiConfidence);
        const hybridScore = (mlScore * mlWeight) + (aiScore * aiWeight);

        return {
            score: hybridScore,
            needs_water: hybridScore > 0.5,
            confidence: hybridScore * 100,
            features: mlPrediction.features,
            method: 'hybrid_ml_ai',
            ai_adjusted: true,
            ml_prediction: {
                score: mlScore,
                needs_water: mlPrediction.needs_water,
                confidence: mlPrediction.confidence
            },
            ai_assessment: {
                needs_water: aiNeedsWater,
                confidence: aiConfidence * 100
            }
        };
    }
}

export const mlService = new MLService();
