import mqtt from 'mqtt';
import { config, defaultSystemConfig } from '../config/config';
import { dataService } from './dataService';
import { mlService } from './mlService';
import { aiService } from './aiService';
import { SensorData } from '../types';

export class MQTTService {
    private client: mqtt.MqttClient;
    private systemConfig = { ...defaultSystemConfig };
    private lastWateringTime: number;
    private sensorData: SensorData[] = [];
    private aiAnalysisHistory: any[] = [];

    // State
    private pumpStatus = 'off';
    private autoMode = false;
    private lastAIAnalysisTime = Date.now();
    private dataPointsSinceLastAI = 0;

    constructor() {
        this.lastWateringTime = dataService.loadLastWateringTime();

        this.client = mqtt.connect(config.MQTT.BROKER_URL, {
            username: config.MQTT.USERNAME,
            password: config.MQTT.PASSWORD,
            port: config.MQTT.PORT,
            protocol: 'mqtts',
            rejectUnauthorized: true
        });

        this.setupListeners();
    }

    private setupListeners() {
        this.client.on('connect', () => {
            console.log('✅ MQTT Connected');
            this.client.subscribe(['plant/sensor', 'plant/status'], (err) => {
                if (!err) console.log('✅ Subscribed to topics');
            });
        });

        this.client.on('error', (err) => console.error('❌ MQTT Error:', err.message));

        this.client.on('message', async (topic, message) => {
            try {
                const data = JSON.parse(message.toString());

                if (topic === 'plant/sensor') {
                    await this.handleSensorData(data);
                } else if (topic === 'plant/status') {
                    this.handleStatusUpdate(data);
                }
            } catch (error: any) {
                console.error('❌ Message handling error:', error.message);
            }
        });
    }

    private async handleSensorData(data: SensorData) {
        data.timestamp = new Date().toISOString();
        if (data.pump_status) this.pumpStatus = data.pump_status;
        if (data.auto_mode !== undefined) this.autoMode = data.auto_mode;

        this.sensorData.push(data);
        if (this.sensorData.length > 1000) this.sensorData.shift();

        console.log(`📊 Sensor: ${data.moisture}% | Pump: ${this.pumpStatus}`);

        // ML Prediction Logic
        if (this.systemConfig.ml_auto_predict) {
            try {
                const hour = new Date().getHours();
                const daysSinceWater = (Date.now() - this.lastWateringTime) / (1000 * 60 * 60 * 24);

                // Hybrid Prediction
                let latestAI = this.aiAnalysisHistory.length > 0 ? this.aiAnalysisHistory[this.aiAnalysisHistory.length - 1] : null;

                const prediction = await mlService.hybridPrediction(
                    data.moisture,
                    hour,
                    daysSinceWater,
                    data.temperature || 25,
                    data.air_humidity || 60,
                    this.systemConfig.ai_auto_analysis ? latestAI : null
                );

                const predictionMsg = { ...prediction, timestamp: new Date().toISOString(), auto: true };
                this.client.publish('plant/ml/prediction', JSON.stringify(predictionMsg));

                if (prediction.needs_water) {
                    console.log(`🌱 Water needed (${prediction.confidence.toFixed(1)}%)`);
                }
            } catch (err) {
                console.error('❌ Auto ML error:', err);
            }
        }

        // AI Logic
        this.checkAndRunAI(data);
    }

    private async checkAndRunAI(data: SensorData) {
        if (!this.systemConfig.ai_auto_analysis || !this.systemConfig.plant_name) return;

        const now = Date.now();
        const timeSince = now - this.lastAIAnalysisTime;
        const shouldRun =
            (timeSince >= this.systemConfig.ai_analysis_interval) ||
            (data.moisture <= this.systemConfig.ai_analysis_threshold) ||
            (this.dataPointsSinceLastAI >= 20);

        if (shouldRun) {
            console.log('🤖 Auto AI Analysis triggered...');
            try {
                const analysis = await aiService.runAnalysis(data.moisture, this.sensorData, this.systemConfig.plant_name);
                this.aiAnalysisHistory.push(analysis);
                if (this.aiAnalysisHistory.length > 50) this.aiAnalysisHistory.shift();

                this.lastAIAnalysisTime = now;
                this.dataPointsSinceLastAI = 0;

                console.log('✅ Auto AI Analysis completed');
            } catch (e) {
                console.error('AI Run failed', e);
            }
        } else {
            this.dataPointsSinceLastAI++;
        }
    }

    private handleStatusUpdate(data: any) {
        if (data.pump === 'on') {
            this.lastWateringTime = Date.now();
            dataService.saveLastWateringTime(this.lastWateringTime);
        }
    }

    // Getters for Controller
    public getStatus() {
        return {
            pump_status: this.pumpStatus,
            auto_mode: this.autoMode,
            mqtt_connected: this.client.connected,
            last_watering: this.lastWateringTime
        };
    }

    public getLatestSensorData() {
        return this.sensorData.length > 0 ? this.sensorData[this.sensorData.length - 1] : null;
    }

    public getSensorHistory(limit: number) {
        return this.sensorData.slice(-limit);
    }

    public updateConfig(newConfig: any) {
        this.systemConfig = { ...this.systemConfig, ...newConfig };
    }

    public getConfig() {
        return this.systemConfig;
    }
}

export const mqttService = new MQTTService();
