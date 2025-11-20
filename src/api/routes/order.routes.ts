import { FastifyInstance } from 'fastify';
import { submitOrder } from '../controllers/order.controller';

export async function orderRoutes(app: FastifyInstance) {
    app.post('/execute', submitOrder);    
}