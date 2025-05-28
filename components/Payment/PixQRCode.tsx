import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { COLORS } from '@/constants/theme';
import { PixQRGenerator } from '@/utils/PixQRGenerator';

interface PixQRCodeProps {
    cnpj: string;
    amount: number;
    companyName: string;
    size?: number;
}

export const PixQRCode = ({ cnpj, amount, companyName, size = 350 }: PixQRCodeProps) => {
    const pixCode = PixQRGenerator.generatePixCode(cnpj, amount);

    return (
        <View style={styles.container}>
            <Text style={styles.companyName}>{companyName}</Text>
            <View style={[styles.qrCodeContainer, { width: size, height: size }]}>
                <QRCode
                    value={pixCode}
                    size={size - 32}
                    backgroundColor="white"
                    color="black"
                />
            </View>
            <Text style={styles.amount}>R$ {amount.toFixed(2)}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    companyName: {
        marginBottom: 16,
        fontSize: 24,
        fontWeight: '500',
        color: COLORS.gray,
        textAlign: 'center',
    },
    qrCodeContainer: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    amount: {
        marginTop: 24,
        fontSize: 32,
        fontWeight: '600',
        color: COLORS.secondary,
    },
}); 