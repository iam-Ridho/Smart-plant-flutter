// ============================================
// AUTO-RETRAIN SYSTEM MODULE
// File: autoRetrain.js
// ============================================

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

class AutoRetrainSystem {
    constructor(config = {}) {
        // Configuration
        this.config = {
            minSamples: config.minSamples || 100,           
            retrainInterval: config.retrainInterval || '0 2 * * *', 
            pythonPath: config.pythonPath || 'python',
            scriptPath: config.scriptPath || './retrain_model.py',
            trainingDataFile: config.trainingDataFile || './ai_training_data.csv',
            autoReload: config.autoReload !== false,        
            modelPath: config.modelPath || './models/plant-model',
            enabled: config.enabled !== false
        };

        // State
        this.isTraining = false;
        this.lastTrainingTime = null;
        this.trainingHistory = [];
        this.scheduledJob = null;
        this.reloadCallback = null;

        // Load history
        this.loadTrainingHistory();
    }

    // ============================================
    // PUBLIC METHODS
    // ============================================

    /**
     * Start the auto-retrain scheduler
     */
    start() {
        if (!this.config.enabled) {
            console.log('⚠️  Auto-Retrain System is disabled');
            return;
        }

        console.log('\n' + '='.repeat(60));
        console.log('🤖 Auto-Retrain System Starting...');
        console.log('='.repeat(60));
        console.log(`⏰ Schedule: ${this.config.retrainInterval}`);
        console.log(`📊 Min samples: ${this.config.minSamples}`);
        console.log(`📁 Training data: ${this.config.trainingDataFile}`);
        console.log(`🐍 Python: ${this.config.pythonPath}`);
        console.log(`📜 Script: ${this.config.scriptPath}`);
        console.log('='.repeat(60) + '\n');

        // Validate Python script exists
        if (!fs.existsSync(this.config.scriptPath)) {
            console.error(`❌ Training script not found: ${this.config.scriptPath}`);
            return;
        }

        // Schedule automatic retraining
        this.scheduledJob = cron.schedule(this.config.retrainInterval, () => {
            this.checkAndRetrain();
        }, {
            scheduled: true,
            timezone: "Asia/Jakarta" // Adjust to your timezone
        });

        console.log('✅ Auto-Retrain System is now active');
        console.log(`📅 Next scheduled check: ${this.getNextScheduledTime()}\n`);
    }

    /**
     * Stop the scheduler
     */
    stop() {
        if (this.scheduledJob) {
            this.scheduledJob.stop();
            console.log('🛑 Auto-Retrain System stopped');
        }
    }

    /**
     * Set callback for model reload
     */
    onModelReload(callback) {
        this.reloadCallback = callback;
    }

    /**
     * Check if retraining is needed and execute
     */
    async checkAndRetrain() {
        console.log('\n' + '='.repeat(60));
        console.log('🔍 AUTO-RETRAIN CHECK');
        console.log('='.repeat(60));
        console.log(`⏰ Time: ${new Date().toLocaleString()}`);

        // Check if already training
        if (this.isTraining) {
            console.log('⚠️  Training already in progress. Skipping.');
            return { success: false, reason: 'already_training' };
        }

        // Check if enough samples
        const sampleCount = this.countTrainingSamples();
        console.log(`📊 Current training samples: ${sampleCount}`);

        if (sampleCount < this.config.minSamples) {
            console.log(`⚠️  Not enough samples (need ${this.config.minSamples}). Skipping.`);
            console.log('='.repeat(60) + '\n');
            return { 
                success: false, 
                reason: 'insufficient_samples', 
                count: sampleCount,
                needed: this.config.minSamples
            };
        }

        // Check time since last training (avoid too frequent)
        if (this.lastTrainingTime) {
            const hoursSinceLastTrain = (Date.now() - this.lastTrainingTime) / (1000 * 60 * 60);
            if (hoursSinceLastTrain < 6) {
                console.log(`⚠️  Last training was ${hoursSinceLastTrain.toFixed(1)} hours ago.`);
                console.log('⏳ Minimum 6 hours between trainings. Skipping.');
                console.log('='.repeat(60) + '\n');
                return { 
                    success: false, 
                    reason: 'too_soon',
                    hours_since_last: hoursSinceLastTrain.toFixed(1)
                };
            }
        }

        // All checks passed
        console.log('✅ All conditions met. Starting retraining...');
        console.log('='.repeat(60) + '\n');
        
        return await this.retrain();
    }

    /**
     * Force retrain (manual trigger)
     */
    async forceRetrain() {
        console.log('\n🚀 MANUAL RETRAIN TRIGGERED');
        
        if (this.isTraining) {
            throw new Error('Training already in progress');
        }

        return await this.retrain();
    }

    /**
     * Get training statistics
     */
    getStats() {
        const successful = this.trainingHistory.filter(t => t.success).length;
        const failed = this.trainingHistory.filter(t => !t.success).length;
        
        const accuracies = this.trainingHistory
            .filter(t => t.success && t.accuracy !== null)
            .map(t => t.accuracy);
        
        const avgAccuracy = accuracies.length > 0 
            ? accuracies.reduce((a, b) => a + b) / accuracies.length 
            : null;

        const lastTraining = this.trainingHistory.length > 0
            ? this.trainingHistory[this.trainingHistory.length - 1]
            : null;

        return {
            enabled: this.config.enabled,
            is_training: this.isTraining,
            total_trainings: this.trainingHistory.length,
            successful_trainings: successful,
            failed_trainings: failed,
            average_accuracy: avgAccuracy ? avgAccuracy.toFixed(4) : null,
            last_training: lastTraining ? {
                timestamp: lastTraining.timestamp,
                success: lastTraining.success,
                accuracy: lastTraining.accuracy,
                duration: lastTraining.duration_seconds
            } : null,
            current_samples: this.countTrainingSamples(),
            min_samples_required: this.config.minSamples,
            ready_for_training: this.countTrainingSamples() >= this.config.minSamples,
            next_scheduled_check: this.getNextScheduledTime(),
            schedule: this.config.retrainInterval
        };
    }

    /**
     * Get training history
     */
    getHistory(limit = 10) {
        return this.trainingHistory.slice(-limit).reverse();
    }

    // ============================================
    // PRIVATE METHODS
    // ============================================

    /**
     * Count training samples in CSV
     */
    countTrainingSamples() {
        try {
            if (!fs.existsSync(this.config.trainingDataFile)) {
                return 0;
            }
            const content = fs.readFileSync(this.config.trainingDataFile, 'utf8');
            const lines = content.split('\n').filter(line => line.trim() !== '');
            return Math.max(0, lines.length - 1); // Exclude header
        } catch (error) {
            console.error('❌ Error counting samples:', error.message);
            return 0;
        }
    }

    /**
     * Execute Python retraining script
     */
    async retrain() {
        return new Promise((resolve, reject) => {
            this.isTraining = true;
            const startTime = Date.now();

            console.log('🎓 Starting Model Retraining...');
            console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
            console.log('-'.repeat(60));

            // Spawn Python process
            const pythonProcess = spawn(this.config.pythonPath, [this.config.scriptPath], {
                cwd: process.cwd(),
                env: process.env
            });

            let output = '';
            let errorOutput = '';

            // Capture stdout
            pythonProcess.stdout.on('data', (data) => {
                const text = data.toString();
                output += text;
                process.stdout.write(text); // Real-time output
            });

            // Capture stderr
            pythonProcess.stderr.on('data', (data) => {
                const text = data.toString();
                errorOutput += text;
                process.stderr.write(text);
            });

            // Handle completion
            pythonProcess.on('close', async (code) => {
                const duration = ((Date.now() - startTime) / 1000).toFixed(1);
                this.isTraining = false;

                console.log('-'.repeat(60));

                if (code === 0) {
                    console.log(`✅ Retraining completed successfully in ${duration}s`);
                    
                    this.lastTrainingTime = Date.now();
                    
                    // Parse metrics from output
                    const metrics = this.parseTrainingOutput(output);

                    // Record training history
                    const trainingRecord = {
                        timestamp: new Date().toISOString(),
                        duration_seconds: parseFloat(duration),
                        success: true,
                        accuracy: metrics.accuracy,
                        precision: metrics.precision,
                        recall: metrics.recall,
                        samples_used: this.countTrainingSamples(),
                        trigger: 'auto'
                    };

                    this.trainingHistory.push(trainingRecord);
                    this.saveTrainingHistory();

                    // Auto-reload model if enabled
                    if (this.config.autoReload) {
                        console.log('🔄 Reloading model...');
                        await this.reloadModel();
                    }

                    console.log('='.repeat(60) + '\n');

                    resolve({
                        success: true,
                        duration: parseFloat(duration),
                        metrics: metrics,
                        message: 'Model retrained successfully'
                    });

                } else {
                    console.error(`❌ Retraining failed with exit code ${code}`);
                    console.error('Error output:', errorOutput);

                    const trainingRecord = {
                        timestamp: new Date().toISOString(),
                        duration_seconds: parseFloat(duration),
                        success: false,
                        error: errorOutput,
                        exit_code: code,
                        trigger: 'auto'
                    };

                    this.trainingHistory.push(trainingRecord);
                    this.saveTrainingHistory();

                    console.log('='.repeat(60) + '\n');

                    reject({
                        success: false,
                        error: 'Python script failed',
                        code: code,
                        output: errorOutput
                    });
                }
            });

            // Handle errors
            pythonProcess.on('error', (error) => {
                this.isTraining = false;
                console.error('❌ Failed to start Python process:', error.message);
                console.log('='.repeat(60) + '\n');
                
                reject({
                    success: false,
                    error: 'Failed to start training process',
                    details: error.message
                });
            });
        });
    }

    /**
     * Parse training output for metrics
     */
    parseTrainingOutput(output) {
        const metrics = {
            accuracy: null,
            precision: null,
            recall: null,
            f1_score: null
        };

        // Try to extract accuracy
        const accMatch = output.match(/Accuracy:\s+([\d.]+)/);
        if (accMatch) {
            metrics.accuracy = parseFloat(accMatch[1]);
        }

        // Try to extract precision
        const precMatch = output.match(/Precision:\s+([\d.]+)/);
        if (precMatch) {
            metrics.precision = parseFloat(precMatch[1]);
        }

        // Try to extract recall
        const recMatch = output.match(/Recall:\s+([\d.]+)/);
        if (recMatch) {
            metrics.recall = parseFloat(recMatch[1]);
        }

        // Calculate F1 if we have precision and recall
        if (metrics.precision && metrics.recall) {
            metrics.f1_score = 2 * (metrics.precision * metrics.recall) / 
                              (metrics.precision + metrics.recall);
        }

        return metrics;
    }

    /**
     * Reload ML model
     */
    async reloadModel() {
        try {
            if (this.reloadCallback) {
                await this.reloadCallback();
                console.log('✅ Model reloaded successfully');
            } else {
                console.log('⚠️  Auto-reload callback not set');
                console.log('💡 Restart server to use new model');
            }
        } catch (error) {
            console.error('❌ Model reload failed:', error.message);
        }
    }

    /**
     * Save training history to file
     */
    saveTrainingHistory() {
        try {
            const historyFile = path.join(__dirname, 'training_history.json');
            const data = {
                last_updated: new Date().toISOString(),
                total_trainings: this.trainingHistory.length,
                history: this.trainingHistory
            };
            fs.writeFileSync(historyFile, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('❌ Failed to save training history:', error.message);
        }
    }

    /**
     * Load training history from file
     */
    loadTrainingHistory() {
        try {
            const historyFile = path.join(__dirname, 'training_history.json');
            if (fs.existsSync(historyFile)) {
                const data = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
                this.trainingHistory = data.history || [];
                
                // Find last training time
                const lastTraining = this.trainingHistory
                    .filter(t => t.success)
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
                
                if (lastTraining) {
                    this.lastTrainingTime = new Date(lastTraining.timestamp).getTime();
                }

                console.log(`📚 Loaded ${this.trainingHistory.length} training records`);
            }
        } catch (error) {
            console.error('❌ Failed to load training history:', error.message);
        }
    }

    /**
     * Get next scheduled time
     */
    getNextScheduledTime() {
        if (!this.scheduledJob) return 'Not scheduled';
        
        // Parse cron expression to get next run time
        // This is approximate for display purposes
        const cronParts = this.config.retrainInterval.split(' ');
        if (cronParts.length >= 2) {
            const hour = cronParts[1];
            const minute = cronParts[0];
            return `Daily at ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
        }
        
        return 'Scheduled';
    }
}

module.exports = AutoRetrainSystem;