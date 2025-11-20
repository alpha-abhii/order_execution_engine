import Fastify, { FastifyInstance } from 'fastify';

const mockOrderCreate = jest.fn();
const mockQueueAdd = jest.fn();

jest.mock('../../infrastructure/queue/order.queue', () => ({
    orderQueue: {
        add: mockQueueAdd,
    },
    ORDER_QUEUE_NAME: 'test-queue',
}));

jest.mock('../../infrastructure/database/prisma-client', () => ({
    prisma: {
        order: {
            create: mockOrderCreate,
        },
    },
}));

import { submitOrder } from './order.controller';
import { prisma } from '../../infrastructure/database/prisma-client';
import { orderQueue } from '../../infrastructure/queue/order.queue';

describe('POST /api/orders/execute', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = Fastify();
        app.post('/execute', submitOrder);
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        mockOrderCreate.mockResolvedValue({
            id: 'test-uuid',
            inputToken: 'SOL',
            outputToken: 'USDC',
            amount: 10,
            status: 'PENDING'
        });
        mockQueueAdd.mockResolvedValue(undefined);
    });

    it('should create an order, queue a job, and return 201 Created', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/execute',
            payload: {
                inputToken: 'SOL',
                outputToken: 'USDC',
                amount: 10
            },
        });

        if (response.statusCode === 500) {
            console.error('Test Failed 500 Body:', response.body);
        }

        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.body);
        expect(body.orderId).toBe('test-uuid');
        expect(body.status).toBe('pending');

        expect(prisma.order.create).toHaveBeenCalledTimes(1);
        expect(orderQueue.add).toHaveBeenCalledTimes(1);
    });

    it('should return 400 Bad Request for invalid input (negative amount)', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/execute',
            payload: {
                inputToken: 'SOL',
                outputToken: 'USDC',
                amount: -5
            },
        });

        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body.message).toContain('Invalid request body');
    });

    it('should return 400 Bad Request for missing required fields', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/execute',
            payload: {},
        });

        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body.message).toContain('Invalid request body');
    });

    it('should return 500 Internal Server Error if database operation fails', async () => {
        mockOrderCreate.mockRejectedValueOnce(new Error('DB Error'));

        const response = await app.inject({
            method: 'POST',
            url: '/execute',
            payload: {
                inputToken: 'SOL',
                outputToken: 'USDC',
                amount: 10
            },
        });

        expect(response.statusCode).toBe(500);
        const body = JSON.parse(response.body);
        expect(body.message).toBe('Internal Server Error');
    });
});