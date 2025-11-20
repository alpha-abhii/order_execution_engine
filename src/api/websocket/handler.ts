import { FastifyRequest } from 'fastify';
import Redis from 'ioredis';
import 'dotenv/config';
import type { WebSocket } from 'ws'; 

const redisSubscriber = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
    password: process.env.REDIS_PASSWORD || undefined,
});

export function handleWebSocket(connection: WebSocket, req: FastifyRequest) {
    const query = req.query as { orderId?: string };
    const orderId = query.orderId;

    if (!orderId) {
        connection.send(JSON.stringify({ error: 'Missing orderId parameter' }));
        connection.close();
        return;
    }

    console.log(`[WS] Client connected for Order: ${orderId}`);

    const channel = `updates:${orderId}`;
    redisSubscriber.subscribe(channel, (err) => {
        if (err) console.error(`[WS] Failed to subscribe to ${channel}: ${err.message}`);
        else console.log(`[WS] Successfully subscribed to ${channel}`);
    });

    const messageHandler = (chan: string, message: string) => {
        if (chan === channel) {
            connection.send(message);
        }
    };

    redisSubscriber.on('message', messageHandler);

    connection.on('close', async () => {
        console.log(`[WS] Client disconnected: ${orderId}`);
        
        redisSubscriber.removeListener('message', messageHandler);
    });
}