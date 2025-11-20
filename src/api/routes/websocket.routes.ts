import { FastifyInstance } from 'fastify';
import { handleWebSocket } from '../websocket/handler';

export async function websocketRoutes(app: FastifyInstance) {
    app.get('/ws', { websocket: true }, handleWebSocket);
}