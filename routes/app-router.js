import express from 'express';

const AppRouter = express.Router();

// Root endpoint - Simple welcome message
AppRouter.get('/', (req, res) => {
    res.send('Hello World!');
});

// Health check endpoint - Returns server status and timestamp
AppRouter.get('/health', (req, res) => {
    // Generate current timestamp in ISO format
    const responseTime = new Date().toISOString();
    const responseBody = { status: 'OK', timestamp: responseTime };
    // Send JSON response with status 200
    res.status(200).json(responseBody);
});

export default AppRouter;