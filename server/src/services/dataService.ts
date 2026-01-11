import fs from 'fs';
import path from 'path';
import { config } from '../config/config';
import { TrainingDataRow } from '../types';

export class DataService {
    private trainingDataQueue: TrainingDataRow[] = [];

    constructor() {
        this.ensureTrainingDataFile();
    }

    private ensureTrainingDataFile() {
        if (!fs.existsSync(config.PATHS.TRAINING_DATA)) {
            const header = 'moisture,hour,days_since_water,temperature,air_humidity,needs_water\n';
            fs.writeFileSync(config.PATHS.TRAINING_DATA, header);
            console.log('📝 Created new training data file');
        }
    }

    public loadLastWateringTime(): number {
        try {
            if (fs.existsSync(config.PATHS.LAST_WATERING)) {
                const data = JSON.parse(fs.readFileSync(config.PATHS.LAST_WATERING, 'utf8'));
                console.log(`💧 Last watering loaded: ${new Date(data.timestamp).toLocaleString()}`);
                return data.timestamp;
            }
        } catch (error) {
            console.error('Error loading watering time:', error);
        }
        return Date.now();
    }

    public saveLastWateringTime(timestamp: number): void {
        try {
            fs.writeFileSync(config.PATHS.LAST_WATERING, JSON.stringify({
                timestamp: timestamp,
                date: new Date(timestamp).toISOString()
            }));
            console.log(`💾 Watering time saved: ${new Date(timestamp).toLocaleString()}`);
        } catch (error) {
            console.error('Error saving watering time:', error);
        }
    }

    public saveTrainingData(dataRow: TrainingDataRow): boolean {
        try {
            const csvRow = `${dataRow.moisture},${dataRow.hour},${dataRow.days_since_water},${dataRow.temperature},${dataRow.air_humidity},${dataRow.needs_water}\n`;

            this.ensureTrainingDataFile();

            fs.appendFileSync(config.PATHS.TRAINING_DATA, csvRow);
            console.log(`💾 Training data saved: moisture=${dataRow.moisture}%, needs_water=${dataRow.needs_water}`);

            return true;
        } catch (error) {
            console.error('❌ Error saving training data:', error);
            return false;
        }
    }

    public queueTrainingData(row: TrainingDataRow) {
        this.trainingDataQueue.push(row);
    }

    public getTrainingQueue(): TrainingDataRow[] {
        return this.trainingDataQueue;
    }

    public clearTrainingQueue() {
        this.trainingDataQueue = [];
    }
}

export const dataService = new DataService();
