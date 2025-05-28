import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import QRCode from 'react-native-qrcode-svg';
import { BitcoinQRGenerator } from '@/utils/BitcoinQRGenerator';
import { PixQRGenerator } from '@/utils/PixQRGenerator';

interface QRCodeModalProps {
    visible: boolean;
    onClose: () => void;
    selectedKey: any;
    isPix: boolean;
    amount: number;
    btcPriceInBRL: number;
}

export const QRCodeModal = ({
    visible,
    onClose,
    selectedKey,
    isPix,
    amount,
    btcPriceInBRL,
}: QRCodeModalProps) => {
    const screenWidth = Dimensions.get('window').width;
    const qrSize = screenWidth * 0.7; // 70% of screen width

    const renderContent = () => {
        if (!selectedKey) {
            return (
                <View style={styles.content}>
                    <Text style={styles.title}>Erro</Text>
                    <Text style={styles.errorText}>Chave de pagamento não encontrada</Text>
                </View>
            );
        }

        if (isPix) {
            if (!selectedKey.key || !selectedKey.company_name) {
                return (
                    <View style={styles.content}>
                        <Text style={styles.title}>Erro</Text>
                        <Text style={styles.errorText}>Dados PIX incompletos</Text>
                    </View>
                );
            }

            const pixQRCode = PixQRGenerator.generatePixCode(selectedKey.key, amount);

            return (
                <View style={styles.content}>
                    <Text style={styles.title}>PIX</Text>
                    <Text style={styles.companyName}>{selectedKey.company_name}</Text>
                    <Text style={styles.address}>{selectedKey.key}</Text>
                    <View style={styles.qrContainer}>
                        <QRCode
                            value={pixQRCode}
                            size={qrSize}
                            backgroundColor="white"
                        />
                    </View>
                    <View style={styles.amountContainer}>
                        <Text style={styles.amount}>R$ {amount.toFixed(2)}</Text>
                    </View>
                </View>
            );
        }

        // Bitcoin QR Code
        if (!selectedKey.address || !selectedKey.network) {
            return (
                <View style={styles.content}>
                    <Text style={styles.title}>Erro</Text>
                    <Text style={styles.errorText}>Dados Bitcoin incompletos</Text>
                </View>
            );
        }

        const qrData = BitcoinQRGenerator.generateQRCode(
            selectedKey.address,
            amount,
            btcPriceInBRL,
            selectedKey.network
        );

        return (
            <View style={styles.content}>
                <Text style={styles.title}>Bitcoin</Text>
                <Text style={styles.address}>{selectedKey.address}</Text>
                <View style={styles.qrContainer}>
                    <QRCode
                        value={qrData}
                        size={qrSize}
                        backgroundColor="white"
                    />
                </View>
                <View style={styles.amountContainer}>
                    <Text style={styles.amount}>R$ {amount.toFixed(2)}</Text>
                    <Text style={styles.btcAmount}>
                        {BitcoinQRGenerator.calculateBitcoinAmount(amount, btcPriceInBRL).toFixed(8)} BTC
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={onClose}>
                            <Feather name="x" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>
                    {renderContent()}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        width: '90%',
        alignItems: 'center',
    },
    modalHeader: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 16,
    },
    content: {
        alignItems: 'center',
        width: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: COLORS.secondary,
        marginBottom: 16,
    },
    companyName: {
        fontSize: 18,
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
        paddingHorizontal: 16,
    },
    qrContainer: {
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 12,
        marginVertical: 16,
    },
    address: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    amountContainer: {
        alignItems: 'center',
        marginTop: 16,
    },
    amount: {
        fontSize: 20,
        fontWeight: '600',
        color: COLORS.secondary,
        marginBottom: 4,
    },
    btcAmount: {
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
        marginTop: 8,
    },
});