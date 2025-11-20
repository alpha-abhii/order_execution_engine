import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { orderRoutes } from './routes/order.routes';


export async function buildServer(): Promise<FastifyInstance> {
    const server = Fastify({
        logger: {
            level: 'info',
            transport: {
                target: 'pino-pretty',
                options: {
                    colorize: true
                }
            }
        }
    });

    await server.register(cors, {
        origin: '*'
    });

    await server.register(websocket);
    
    server.get('/ping', async (request, reply) => {
        return { status: 'ok' , timeStamp: new Date().toISOString()};
    });

    await server.register(orderRoutes, { prefix: '/api/orders' });

    return server;
}