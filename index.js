import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase } from './config/connect-db.js';
import AppRouter from './routes/app-router.js';
import BlogRoutes from './routes/blog-routes.js';

// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();

// ================================
// MIDDLEWARE SETUP
// ================================

// Parse incoming JSON requests and make data available in req.body
app.use(express.json());

// ================================
// ROUTE DEFINITIONS
// ================================

// Use app router for root and health check endpoints
app.use('/', AppRouter);

// Use blog routes
app.use('/', BlogRoutes);

// ================================
// ERROR HANDLING MIDDLEWARE
// ================================

// 404 handler - Catches all unmatched routes
// This middleware runs when no previous route matches the request
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global error handler - Catches all unhandled errors
// Must have 4 parameters (err, req, res, next) to be recognized as error middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// ================================
// SERVER STARTUP
// ================================
const startServer = async () => {
    const dbConnected = await connectDatabase();
    
    if (!dbConnected) {
        process.exit(1);
    }

    const PORT = process.env.PORT || 3000;
    const isProduction = process.env.NODE_ENV === 'production';

    app.listen(PORT, () => {
        if (isProduction) {
            console.log(`🚀 Server is running in production on port ${PORT}`);
        } else {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
        }
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
};

startServer();

export default app;