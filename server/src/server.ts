import express from 'express';
import cors from 'cors';
import { config } from './config/config';

import plantRoutes from './routes/plantRoutes';
import { mlService } from './services/mlService';

const app = express();

app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api', plantRoutes);
app.use('/models', express.static(config.PATHS.MODELS));

// Initialize and Start
const start = async () => {
    app.listen(config.PORT, async () => {
        console.log(`\n🚀 Server running on port ${config.PORT}`);
        console.log(`📡 URL: http://localhost:${config.PORT}`);

        // Load model via HTTP after server starts
        await mlService.loadModel();
    });
};

start();
