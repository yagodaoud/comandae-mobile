export class BitcoinPriceService {
    private static readonly COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=';
    private static readonly CACHE_DURATION = 60000; // 1 minute in milliseconds
    private static priceCache: { [currency: string]: { price: number; timestamp: number } } = {};

    public static async getBitcoinPrice(currency: string): Promise<number> {
        try {
            // Check cache first
            const cachedPrice = this.getCachedPrice(currency);
            if (cachedPrice !== null) {
                return cachedPrice;
            }

            const response = await fetch(this.COINGECKO_API_URL + currency.toLowerCase());

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!data || !data.bitcoin || !data.bitcoin[currency.toLowerCase()]) {
                throw new Error('Invalid response format from CoinGecko API');
            }

            const price = data.bitcoin[currency.toLowerCase()];

            // Validate price
            if (typeof price !== 'number' || price <= 0) {
                throw new Error('Invalid price received from CoinGecko API');
            }

            // Cache the price
            this.cachePrice(currency, price);

            return price;
        } catch (error) {
            console.error('Error fetching Bitcoin price:', error);
            // If we have a cached price, use it even if expired
            const cachedPrice = this.getCachedPrice(currency, true);
            if (cachedPrice !== null) {
                return cachedPrice;
            }
            throw new Error('Failed to fetch Bitcoin price');
        }
    }

    public static async getCurrentBitcoinPriceInBRL(): Promise<number> {
        return this.getBitcoinPrice('brl');
    }

    private static getCachedPrice(currency: string, allowExpired: boolean = false): number | null {
        const cached = this.priceCache[currency];
        if (!cached) return null;

        const now = Date.now();
        if (!allowExpired && now - cached.timestamp > this.CACHE_DURATION) {
            return null;
        }

        return cached.price;
    }

    private static cachePrice(currency: string, price: number): void {
        this.priceCache[currency] = {
            price,
            timestamp: Date.now()
        };
    }
}