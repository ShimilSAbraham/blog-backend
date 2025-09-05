import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
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

// Root endpoint - Simple welcome message
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Health check endpoint - Returns server status and timestamp
app.get('/health', (req, res) => {
    // Generate current timestamp in ISO format
    const responseTime = new Date().toISOString();
    const responseBody = { status: 'OK', timestamp: responseTime };
    // Send JSON response with status 200
    res.status(200).json(responseBody);
});

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
// DATABASE CONNECTION & SERVER STARTUP
// ================================

// Connect to MongoDB using connection string from environment variables
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('\n✅ Connected to MongoDB');

        const PORT = process.env.PORT || 3000;
        const isProduction = process.env.NODE_ENV === 'production';

        // Start the Express server only after successful database connection
        // This ensures the app doesn't accept requests before it's fully ready
        app.listen(PORT, () => {
            if (isProduction) {
                console.log(`🚀 Server is running in production on port ${PORT}`);
            } else {
                console.log(`🚀 Server is running on http://localhost:${PORT}`);
            }
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
    });