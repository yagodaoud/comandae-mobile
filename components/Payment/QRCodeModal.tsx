import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import QRCode from 'react-native-qrcode-svg';
import { BitcoinQRGenerator } from '@/utils/BitcoinQRGenerator';
import { PixQRGenerator } from '@/utils/PixQRGenerator';
import { Id } from '@/convex/_generated/dataModel';

interface PixKey {
    _id: Id<'pix'>;
    type: 'cpf' | 'cnpj' | 'email' | 'phone';
    key: string;
    city: string;
    company_name: string;
    isActive: boolean;
}

interface BitcoinKey {
    _id: Id<'bitcoin'>;
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
    const qrSize = useMemo(() => screenWidth * 0.7, [screenWidth]); // 70% of screen width

    const handleClose = useCallback(() => {
        try {
            onClose();
        } catch (error) {
            console.error('Error closing QR code modal:', error);
        }
    }, [onClose]);

    const renderPixContent = useCallback(() => {
        if (!selectedKey || !('key' in selectedKey)) {
            console.log('PIX: No key found');
            return (
                <View style={styles.content}>
                    <Text style={styles.title}>Erro</Text>
                    <Text style={styles.errorText}>Chave PIX não encontrada</Text>
                </View>
            );
        }

        const pixKey = selectedKey as PixKey;
        console.log('PIX Key:', pixKey);

        if (!pixKey.key || !pixKey.company_name) {
            console.log('PIX: Incomplete data', { key: pixKey.key, company: pixKey.company_name });
            return (
                <View style={styles.content}>
                    <Text style={styles.title}>Erro</Text>
                    <Text style={styles.errorText}>Dados PIX incompletos</Text>
                </View>
            );
        }

        try {
            const safeAmount = Math.max(0, amount);
            console.log('Generating PIX QR code for:', { key: pixKey.key, amount: safeAmount });
            const pixQRCode = PixQRGenerator.generatePixCode(pixKey.key, safeAmount);
            console.log('Generated PIX QR code:', pixQRCode);

            if (!pixQRCode) {
                throw new Error('Failed to generate PIX QR code');
            }

            return (
                <View style={styles.content}>
                    <Text style={styles.title}>PIX</Text>
                    <Text style={styles.companyName}>{pixKey.company_name}</Text>
                    <Text style={styles.address}>{pixKey.key}</Text>
                    <View style={styles.qrContainer}>
                        <QRCode
                            value={pixQRCode}
                            size={qrSize}
                            backgroundColor="white"
                            quietZone={10}
                            onError={(error: Error) => {
                                console.error('QR Code generation error:', error);
                            }}
                        />
                    </View>
                    <View style={styles.amountContainer}>
                        <Text style={styles.amount}>R$ {safeAmount.toFixed(2)}</Text>
                    </View>
                </View>
            );
        } catch (error) {
            console.error('Error generating PIX QR code:', error);
            return (
                <View style={styles.content}>
                    <Text style={styles.title}>Erro</Text>
                    <Text style={styles.errorText}>Erro ao gerar QR Code PIX</Text>
                </View>
            );
        }
    }, [selectedKey, amount, qrSize]);

    const renderBitcoinContent = useCallback(() => {
        if (!selectedKey || !('address' in selectedKey)) {
            console.log('BTC: No address found');
            return (
                <View style={styles.content}>
                    <Text style={styles.title}>Erro</Text>
                    <Text style={styles.errorText}>Endereço Bitcoin não encontrado</Text>
                </View>
            );
        }

        const btcKey = selectedKey as BitcoinKey;
        console.log('BTC Key:', btcKey);

        if (!btcKey.address || !btcKey.network) {
            console.log('BTC: Incomplete data', { address: btcKey.address, network: btcKey.network });
            return (
                <View style={styles.content}>
                    <Text style={styles.title}>Erro</Text>
                    <Text style={styles.errorText}>Dados Bitcoin incompletos</Text>
                </View>
            );
        }

        try {
            const safeAmount = Math.max(0, amount);
            console.log('Generating BTC QR code for:', { address: btcKey.address, amount: safeAmount, btcPriceInBRL });
            const qrData = BitcoinQRGenerator.generateQRCode(
                btcKey.address,
                safeAmount,
                btcPriceInBRL,
                btcKey.network
            );
            console.log('Generated BTC QR code:', qrData);

            if (!qrData) {
                throw new Error('Failed to generate Bitcoin QR code');
            }

            const btcAmount = BitcoinQRGenerator.calculateBitcoinAmount(safeAmount, btcPriceInBRL);

            return (
                <View style={styles.content}>
                    <Text style={styles.title}>Bitcoin</Text>
                    <Text style={styles.address}>{btcKey.address}</Text>
                    <View style={styles.qrContainer}>
                        <QRCode
                            value={qrData}
                            size={qrSize}
                            backgroundColor="white"
                            quietZone={10}
                            onError={(error: Error) => {
                                console.error('QR Code generation error:', error);
                            }}
                        />
                    </View>
                    <View style={styles.amountContainer}>
                        <Text style={styles.amount}>R$ {safeAmount.toFixed(2)}</Text>
                        <Text style={styles.btcAmount}>
                            {btcAmount.toFixed(8)} BTC
                        </Text>
                    </View>
                </View>
            );
        } catch (error) {
            console.error('Error generating Bitcoin QR code:', error);
            return (
                <View style={styles.content}>
                    <Text style={styles.title}>Erro</Text>
                    <Text style={styles.errorText}>Erro ao gerar QR Code Bitcoin</Text>
                </View>
            );
        }
    }, [selectedKey, amount, btcPriceInBRL, qrSize]);

    const renderContent = useCallback(() => {
        if (!selectedKey) {
            return (
                <View style={styles.content}>
                    <Text style={styles.title}>Erro</Text>
                    <Text style={styles.errorText}>Chave de pagamento não encontrada</Text>
                </View>
            );
        }

        return isPix ? renderPixContent() : renderBitcoinContent();
    }, [selectedKey, isPix, renderPixContent, renderBitcoinContent]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
            statusBarTranslucent
        >
            <View style={styles.modalOverlay}>
                <View style={[
                    styles.modalContent,
                    Platform.OS === 'ios' && { paddingTop: 40 }
                ]}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity
                            onPress={handleClose}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
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
        maxWidth: 400,
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
            },
            android: {
                elevation: 5,
            },
        }),
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
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
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