import 'dotenv/config';
import { ConnectionOptions } from 'bullmq';
import IORedis from 'ioredis';

const getRedisConfig = (): ConnectionOptions => {
    if (process.env.REDIS_URL) {
        const connection = new IORedis(process.env.REDIS_URL, { 
            maxRetriesPerRequest: null, 
            enableReadyCheck: false,
            lazyConnect: true
        });

        return {
            host: connection.options.host,
            port: connection.options.port,
            username: connection.options.username,
            password: connection.options.password,
            db: connection.options.db,
            tls: connection.options.tls,
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
        };
    }

    return {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT && !isNaN(parseInt(process.env.REDIS_PORT))
            ? parseInt(process.env.REDIS_PORT)
            : 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        maxRetriesPerRequest: null,
    };
};

export const redisConnection = getRedisConfig();