// Load environment variables BEFORE any other module reads process.env.
// (ES module imports are evaluated in order, so this must stay first.)
import 'dotenv/config';

import mongoose from 'mongoose';
import { createServer } from 'http';
import { assertRequiredEnv } from './config/env.js';
import { createApp } from './app.js';
import { initializeSocket } from './socket.js';
import GamificationService from './services/gamificationService.js';
import { seedBlueprint } from './services/questionImport.js';

assertRequiredEnv();

const PORT = process.env.PORT || 5003;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurotrace';

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB');
        try {
            await GamificationService.initializeDefaultAchievements();
            await seedBlueprint();
            console.log('✅ Achievements and blueprint initialized');
        } catch (error) {
            console.error('⚠️ Startup seeding failed:', error.message);
        }
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
    });

const app = createApp();
const httpServer = createServer(app);
initializeSocket(httpServer);

httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
