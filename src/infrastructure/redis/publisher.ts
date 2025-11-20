import Redis from 'ioredis';
import 'dotenv/config';


export const redisPublisher = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
    password: process.env.REDIS_PASSWORD || undefined,
});

export async function publishOrderUpdate(orderId: string, status: string, data: any = {}) {
    const channel = `updates:${orderId}`;
    const message = JSON.stringify({ status, ...data, timestamp: new Date().toISOString() });

    try {
        await redisPublisher.publish(channel, message);
        console.log(`[PubSub] Sent ${status} update to ${channel}`);
    } catch (error) {
        console.error(`[PubSub ERROR] Failed to publish update for ${orderId}:`, error);
    }
}