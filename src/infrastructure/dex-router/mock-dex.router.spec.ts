import { MockDexRouter } from './mock-dex.router';

describe('MockDexRouter', () => {
    let router: MockDexRouter;

    beforeEach(() => {
        router = new MockDexRouter();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should return quotes from both Raydium and Meteora', async () => {
        const quotes = await router.getQuotes('SOL', 'USDC', 1);

        expect(quotes).toHaveLength(2);
        expect(quotes.find(q => q.dex === 'Raydium')).toBeDefined();
        expect(quotes.find(q => q.dex === 'Meteora')).toBeDefined();
    });

    it('should return prices with variance (not identical)', async () => {
        const quotes = await router.getQuotes('SOL', 'USDC', 1);
        const raydium = quotes.find(q => q.dex === 'Raydium');
        const meteora = quotes.find(q => q.dex === 'Meteora');

        expect(raydium?.price).not.toBe(meteora?.price);
        expect(raydium?.price).toBeGreaterThan(0);
    });

    it('should execute swap and return transaction hash', async () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.5);

        const result = await router.executeSwap('Raydium', 'SOL', 1);

        expect(result.status).toBe('success');
        expect(result.txHash).toContain('mock_tx_');
        expect(result.executedPrice).toBeGreaterThan(0);
    });

    it('should throw an error for an unknown DEX during swap execution', async () => {
        await expect(router.executeSwap('UnknownDEX', 'SOL', 1))
            .rejects
            .toThrow('Unknown DEX: UnknownDEX');
    });
});