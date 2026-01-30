import mongoose from 'mongoose';
import { env } from '../env';
import logger from '../logger';

async function server_connection(): Promise<void> {
    try {
        await mongoose.connect(env.MONGO_URI, {
            autoIndex: true
        } as mongoose.ConnectOptions);
        
        console.log('Database is connected successfully');
        logger.info("Database is connected successfully");
    } catch (error) {
        console.log("Database connection failed");
        logger.error("Database connection failed");
    }
}

export { server_connection };
