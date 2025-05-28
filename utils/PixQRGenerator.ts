import { QRCode } from 'react-native-qrcode-svg';

export class PixQRGenerator {
    private static readonly PIX_DOMAIN = 'BR.GOV.BCB.PIX';
    private static readonly MERCHANT_CATEGORY_CODE = '0000';
    private static readonly COUNTRY_CODE = 'BR';
    private static readonly CURRENCY = '986';

    public static generatePixCode(cnpj: string, amount: number): string {
        const payload = new Array<string>();

        // PIX Domain
        payload.push('00020126');
        payload.push('360014' + this.PIX_DOMAIN);

        // CNPJ
        payload.push('01' + this.padStart(cnpj.length.toString(), 2) + cnpj);

        // Merchant Category Code
        payload.push('5204' + this.MERCHANT_CATEGORY_CODE);

        // Currency
        payload.push('5303' + this.CURRENCY);

        // Amount
        const amountStr = amount.toFixed(2);
        payload.push('54' + this.padStart(amountStr.length.toString(), 2) + amountStr);

        // Country Code
        payload.push('5802' + this.COUNTRY_CODE);

        // Merchant Name
        payload.push('5901N');

        // City
        payload.push('6001C');

        // Additional Data
        payload.push('62070503***');

        // CRC
        payload.push('6304');

        const payloadStr = payload.join('');
        const crc = this.crc16(payloadStr);
        return payloadStr + crc;
    }

    private static padStart(str: string, targetLength: number, padString: string = '0'): string {
        if (str.length >= targetLength) {
            return str;
        }
        return padString.repeat(targetLength - str.length) + str;
    }

    private static crc16(payload: string): string {
        const polynomial = 0x1021;
        let crc = 0xFFFF;

        for (let i = 0; i < payload.length; i++) {
            crc ^= (payload.charCodeAt(i) & 0xFF) << 8;
            for (let j = 0; j < 8; j++) {
                if ((crc & 0x8000) !== 0) {
                    crc = (crc << 1) ^ polynomial;
                } else {
                    crc <<= 1;
                }
            }
        }
        crc &= 0xFFFF;

        return crc.toString(16).toUpperCase().padStart(4, '0');
    }
} 