export type BitcoinNetwork = 'mainnet' | 'testnet' | 'lightning';

class BitcoinQRGenerator {
    private static readonly SATS_PER_BTC = 100000000;
    private static readonly DEFAULT_FEE_RATE = 1; // 1 sat/byte

    public static generateQRCode(
        address: string,
        amountInBRL: number,
        btcPriceInBRL: number,
        network: BitcoinNetwork
    ): string {
        if (network === 'lightning') {
            return this.generateLightningQR(address, amountInBRL, btcPriceInBRL);
        }
        return this.generateOnChainQR(address, amountInBRL, btcPriceInBRL);
    }

    public static calculateBitcoinAmount(amountInBRL: number, btcPriceInBRL: number): number {
        return amountInBRL / btcPriceInBRL;
    }

    private static generateOnChainQR(
        address: string,
        amountInBRL: number,
        btcPriceInBRL: number
    ): string {
        const btcAmount = this.calculateBitcoinAmount(amountInBRL, btcPriceInBRL);
        const satoshis = Math.floor(btcAmount * this.SATS_PER_BTC);
        return `bitcoin:${address}?amount=${btcAmount.toFixed(8)}`;
    }

    private static generateLightningQR(
        address: string,
        amountInBRL: number,
        btcPriceInBRL: number
    ): string {
        const btcAmount = this.calculateBitcoinAmount(amountInBRL, btcPriceInBRL);
        const satoshis = Math.floor(btcAmount * this.SATS_PER_BTC);
        return `lightning:${address}?amount=${satoshis}`;
    }

    public static satoshisToBTC(satoshis: number): number {
        return satoshis / this.SATS_PER_BTC;
    }

    public static btcToSatoshis(btc: number): number {
        return Math.round(btc * this.SATS_PER_BTC);
    }
}

export { BitcoinQRGenerator }; 