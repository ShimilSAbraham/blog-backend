import express from 'express';
import dotenv from 'dotenv';
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
    console.error(`404 - Route not found: ${req.originalUrl}`);
    res.status(404).json({ error: 'Route not found' });
});

// Global error handler - Catches all unhandled errors
// Must have 4 parameters (err, req, res, next) to be recognized as error middleware
app.use((err, req, res, next) => {
    console.error(`Error stack: ${err.stack}`);
    res.status(500).json({ error: 'Something went wrong!' });
});

// ================================
// SERVER STARTUP
// ================================
const startServer = async () => {
    console.log('Starting server...');
    const dbConnected = await connectDatabase();
    
    if (!dbConnected) {
        console.error('Failed to connect to the database. Exiting...');
        process.exit(1);
    }

    // listening to PORT is not required in some cloud platforms
    if (process.env.PORT) {
        app.listen(process.env.PORT, () => {
            // NODE_ENV is undefined in local dev by default
            if (process.env.NODE_ENV) {
                console.log(`🚀 Server is running in ${process.env.NODE_ENV}`);
            } else {
                console.log(`🚀 Server is running on http://localhost:${process.env.PORT}`);
            }
        });
    }
    else {
        console.log(`🚀 Server is running in production`);
    }
};

startServer();

export default app;