import { Worker, Job } from 'bullmq';
import { prisma } from '../infrastructure/database/prisma-client';
import { redisConnection } from '../infrastructure/redis/config';
import { ORDER_QUEUE_NAME } from '../infrastructure/queue/order.queue';
import { MockDexRouter } from '../infrastructure/dex-router/mock-dex.router';
import { publishOrderUpdate } from '../infrastructure/redis/publisher';
import { OrderJobData } from '../core/entities/order.entity';
import { OrderStatus } from '../../generated/prisma/enums';

const router = new MockDexRouter();

const processOrder = async (job: Job<OrderJobData>) => {
    const { orderId, inputToken, outputToken, amount } = job.data;
    console.log(`[Worker] Processing Order: ${orderId}`);

    try {
        // --- STATE 1: PENDING ---
        await publishOrderUpdate(orderId, 'PENDING');

        // --- STATE 2: ROUTING ---
        const quotes = await router.getQuotes(inputToken, outputToken, amount);

        const bestQuote = quotes.sort((a, b) => a.price - b.price)[0];

        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: OrderStatus.ROUTING,
                selectedDex: bestQuote.dex
            },
        });

        await publishOrderUpdate(orderId, 'ROUTING', {
            bestRoute: bestQuote.dex,
            price: bestQuote.price
        });

        // --- STATE 3: EXECUTION ---
        const result = await router.executeSwap(bestQuote.dex, inputToken, amount);

        // --- STATE 4: CONFIRMED ---
        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: OrderStatus.CONFIRMED,
                txHash: result.txHash,
                executedPrice: result.executedPrice,
            },
        });

        await publishOrderUpdate(orderId, 'CONFIRMED', {
            txHash: result.txHash,
            finalPrice: result.executedPrice,
        });

        console.log(`[Worker] Order ${orderId} Completed!`);
        return result;

    } catch (error: any) {
        console.error(`[Worker] Order ${orderId} Failed:`, error.message);

        if (job.attemptsMade >= (job.opts.attempts || 3) - 1) {
            await prisma.order.update({
                where: { id: orderId },
                data: {
                    status: OrderStatus.FAILED,
                    failureReason: error.message
                }
            });
            await publishOrderUpdate(orderId, 'FAILED', { reason: error.message });
        }

        throw error;
    }
};

export const orderWorker = new Worker(ORDER_QUEUE_NAME, processOrder, {
    connection: redisConnection,
    concurrency: 10,
    limiter: {
        max: 100,  
        duration: 60000
    }
});


console.log(`[Worker Setup] Order Worker initialized. Concurrency: 10. Rate Limit: 100 jobs/min.`);