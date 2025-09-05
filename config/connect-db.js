import mongoose from 'mongoose';

// Connect to MongoDB using connection string from environment variables
export const connectDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('\n✅ Connected to MongoDB');
        return true;
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        return false;
    }
};