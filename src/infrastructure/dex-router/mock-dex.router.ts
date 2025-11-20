import { IDexRouter, Quote, SwapResult } from '../../core/interfaces/dex-router.interface';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockDexRouter implements IDexRouter {
    async getQuotes(tokenIn: string, tokenOut: string, amount: number): Promise<Quote[]> {
        await delay(200 + Math.random() * 100);

        const basePrice = 150 + (Math.random() * 5);

        const raydiumPrice = basePrice * (1 + (Math.random() * 0.02));
        const meteoraPrice = basePrice * (1 - (Math.random() * 0.03));

        return [
            { dex: 'Raydium', price: raydiumPrice, fee: 0.003 },
            { dex: 'Meteora', price: meteoraPrice, fee: 0.002 },
        ];
    }

    async executeSwap(dex: string, tokenIn: string, amount: number): Promise<SwapResult> {
        const supportedDexs = ['Raydium', 'Meteora'];
        if (!supportedDexs.includes(dex)) {
            throw new Error(`Unknown DEX: ${dex}`);
        }

        await delay(2000 + Math.random() * 1000);

        const shouldFail = Math.random() < 0.1;
        if (shouldFail) {
            throw new Error('Simulated Slippage Error: Transaction failed');
        }

        return {
            txHash: 'mock_tx_' + Math.random().toString(36).substring(7),
            executedPrice: 150,
            status: 'success',
        };
    }
}