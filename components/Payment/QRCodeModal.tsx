import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { PixQRCode } from './PixQRCode';

interface PixKey {
    _id: string;
    type: 'cpf' | 'cnpj' | 'email' | 'phone';
    key: string;
    city: string;
    company_name: string;
    isActive: boolean;
}

interface BitcoinKey {
    _id: string;
    network: 'mainnet' | 'testnet' | 'lightning';
    address: string;
    isActive: boolean;
}

type PaymentKey = PixKey | BitcoinKey;

interface QRCodeModalProps {
    visible: boolean;
    onClose: () => void;
    selectedKey: PaymentKey | null;
    isPix: boolean;
    amount: number;
}

export const QRCodeModal = ({ visible, onClose, selectedKey, isPix, amount }: QRCodeModalProps) => {
    if (!selectedKey) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.qrCodeContainer}>
                <View style={styles.qrCodeHeader}>
                    <TouchableOpacity onPress={onClose}>
                        <Feather name="x" size={24} color="#666" />
                    </TouchableOpacity>
                    <Text style={styles.qrCodeTitle}>
                        {isPix ? 'QR Code PIX' : 'QR Code Bitcoin'}
                    </Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={styles.qrCodeContent}>
                    {isPix ? (
                        <PixQRCode
                            cnpj={(selectedKey as PixKey).key}
                            amount={amount}
                            companyName={(selectedKey as PixKey).company_name}
                        />
                    ) : (
                        <View style={styles.bitcoinContainer}>
                            <View style={styles.qrCodePlaceholder}>
                                <Feather name="bitcoin" size={200} color="#ccc" />
                            </View>
                            <Text style={styles.qrCodeInfo}>
                                {(selectedKey as BitcoinKey).address}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    qrCodeContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    qrCodeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    qrCodeTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.secondary,
    },
    qrCodeContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    bitcoinContainer: {
        alignItems: 'center',
    },
    qrCodePlaceholder: {
        width: 250,
        height: 250,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    qrCodeInfo: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 16,
    },
}); 