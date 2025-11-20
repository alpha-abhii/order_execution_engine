import { Queue } from "bullmq";
import { redisConnection } from "../redis/config";
import { OrderJobData } from "../../core/entities/order.entity";

export const ORDER_QUEUE_NAME = 'order-execution-queue';

export const orderQueue = new Queue<OrderJobData>(ORDER_QUEUE_NAME, {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: 100,
        removeOnFail: 500,
    },
});

orderQueue.on('error', (err) => {
    console.error(`BullMQ Queue Error [${ORDER_QUEUE_NAME}]:`, err); 
});

export async function closeQueue() {
    await orderQueue.close();
}