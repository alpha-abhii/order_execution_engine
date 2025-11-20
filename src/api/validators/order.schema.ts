import { z } from 'zod';

export const OrderSchema = z.object({
    inputToken: z.string().min(1, "Input token is required").default("SOL"),
    outputToken: z.string().min(1, "Output token is required").default("USDC"),
    amount: z.number().positive("Amount must be greater than 0"),
});

export type OrderInput = z.infer<typeof OrderSchema>;