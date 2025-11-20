// The shape of a price quote
export interface Quote {
    dex: 'Raydium' | 'Meteora';
    price: number;
    fee: number;
}

// The result after a swap is done
export interface SwapResult {
    txHash: string;
    executedPrice: number;
    status: 'success' | 'failed';
}

// The Contract: Any router (Mock or Real) MUST have these methods
export interface IDexRouter {
    getQuotes(tokenIn: string, tokenOut: string, amount: number): Promise<Quote[]>;
    executeSwap(dex: string, tokenIn: string, amount: number): Promise<SwapResult>;
}