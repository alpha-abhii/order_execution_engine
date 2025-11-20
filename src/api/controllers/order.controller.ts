import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../../infrastructure/database/prisma-client';
import { orderQueue, ORDER_QUEUE_NAME } from '../../infrastructure/queue/order.queue';
import { OrderSchema } from '../validators/order.schema';

export async function submitOrder(request: FastifyRequest, reply: FastifyReply) {
    const result = OrderSchema.safeParse(request.body);

    if (!result.success) {
        return reply.code(400).send({
            message: 'Invalid request body',
            errors: result.error.issues,
        });
    }

    const body = result.data;

    try {
        const order = await prisma.order.create({
            data: {
                inputToken: body.inputToken,
                outputToken: body.outputToken,
                amount: body.amount,
                status: 'PENDING',
            },
        });

        await orderQueue.add(ORDER_QUEUE_NAME, {
            orderId: order.id,
            inputToken: order.inputToken,
            outputToken: order.outputToken,
            amount: order.amount,
        });

        request.log.info(`Order ${order.id} submitted and queued`);

        return reply.code(201).send({
            message: 'Order received',
            orderId: order.id,
            status: 'pending',
        });

    } catch (error: any) {
        request.log.error(error);
        return reply.code(500).send({ 
            message: 'Internal Server Error',
            debug: error?.message || 'Unknown error'
        });
    }
}