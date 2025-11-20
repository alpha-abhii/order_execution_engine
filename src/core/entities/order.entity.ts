export interface OrderJobData {
    orderId: string;
    inputToken: string;
    outputToken: string;
    amount: number;
    userId?: string;
}

export interface Quote {
    dex: 'Raydium' | 'Meteora';
    price: number;
    fee: number;
}