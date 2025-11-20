import 'dotenv/config';
import { ConnectionOptions } from 'bullmq';

export const redisConnection: ConnectionOptions = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT && !isNaN(parseInt(process.env.REDIS_PORT)) 
          ? parseInt(process.env.REDIS_PORT) 
          : 6379,
    password: process.env.REDIS_PASSWORD || undefined,
};