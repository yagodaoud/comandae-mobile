import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { EmptyState } from '@/components/EmptyState';
import { QRCodeModal } from './QRCodeModal';

interface PaymentMethod {
    id: string;
    name: string;
    icon: string;
    iconType: 'feather' | 'material';
}

interface PaymentMethodSelectorProps {
    paymentMethods: PaymentMethod[];
    selectedPaymentMethod: string;
    onSelectPaymentMethod: (method: string) => void;
    cashAmount?: string;
    onCashAmountChange?: (amount: string) => void;
    grandTotal?: string;
}

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

export const PaymentMethodSelector = ({
    paymentMethods,
    selectedPaymentMethod,
    onSelectPaymentMethod,
    cashAmount,
    onCashAmountChange,
    grandTotal,
}: PaymentMethodSelectorProps) => {
    const [showKeysModal, setShowKeysModal] = useState(false);
    const [showQRCode, setShowQRCode] = useState(false);
    const [selectedKey, setSelectedKey] = useState<PaymentKey | null>(null);

    const pixConfig = useQuery(api.pix.getPixConfig);
    const bitcoinConfig = useQuery(api.bitcoin.getBitcoinConfig);

    const renderIcon = (method: PaymentMethod) => {
        if (method.iconType === 'material') {
            return <MaterialCommunityIcons name={method.icon as any} size={20} color={selectedPaymentMethod === method.id ? '#fff' : '#666'} />;
        }
        return <Feather name={method.icon as any} size={20} color={selectedPaymentMethod === method.id ? '#fff' : '#666'} />;
    };

    const handleQRCodePress = () => {
        setShowKeysModal(true);
    };

    const handleKeySelect = (key: PaymentKey) => {
        setSelectedKey(key);
        setShowKeysModal(false);
        setShowQRCode(true);
    };

    const renderKeysModal = () => {
        const isPix = selectedPaymentMethod === 'pix';
        const keys: PaymentKey[] = [];

        if (isPix && pixConfig) {
            keys.push(pixConfig as PixKey);
        } else if (!isPix && bitcoinConfig) {
            keys.push(bitcoinConfig as BitcoinKey);
        }

        return (
            <Modal
                visible={showKeysModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowKeysModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {isPix ? 'Chaves PIX' : 'Endereços Bitcoin'}
                            </Text>
                            <TouchableOpacity onPress={() => setShowKeysModal(false)}>
                                <Feather name="x" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.keysList}>
                            {keys.length > 0 ? (
                                keys.map((key: PaymentKey) => (
                                    <TouchableOpacity
                                        key={key._id}
                                        style={styles.keyItem}
                                        onPress={() => handleKeySelect(key)}
                                    >
                                        <View style={styles.keyInfo}>
                                            <Text style={styles.keyLabel}>
                                                {isPix ? (key as PixKey).type : (key as BitcoinKey).network}
                                            </Text>
                                            <Text style={styles.keyValue} numberOfLines={1}>
                                                {isPix ? (key as PixKey).key : (key as BitcoinKey).address}
                                            </Text>
                                            {isPix && (key as PixKey).company_name && (
                                                <Text style={styles.companyName}>
                                                    {(key as PixKey).company_name}
                                                </Text>
                                            )}
                                        </View>
                                        <Feather name="chevron-right" size={20} color="#666" />
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <EmptyState
                                    icon={
                                        isPix ? (
                                            <Feather name="smartphone" size={48} color="#ccc" />
                                        ) : (
                                            <MaterialCommunityIcons name="bitcoin" size={48} color="#ccc" />
                                        )
                                    }
                                    message={
                                        isPix
                                            ? "Nenhuma chave PIX configurada"
                                            : "Nenhum endereço Bitcoin configurado"
                                    }
                                />
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Forma de Pagamento</Text>
            <View style={styles.paymentMethodsCard}>
                {paymentMethods.map(method => (
                    <TouchableOpacity
                        key={method.id}
                        style={[
                            styles.paymentMethodButton,
                            selectedPaymentMethod === method.id && styles.paymentMethodActive
                        ]}
                        onPress={() => onSelectPaymentMethod(method.id)}
                    >
                        {renderIcon(method)}
                        <Text style={[
                            styles.paymentMethodText,
                            selectedPaymentMethod === method.id && styles.paymentMethodTextActive
                        ]}>
                            {method.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {(selectedPaymentMethod === 'pix' || selectedPaymentMethod === 'bitcoin') && (
                <TouchableOpacity
                    style={styles.qrCodeButton}
                    onPress={handleQRCodePress}
                >
                    <Feather name="camera" size={20} color={COLORS.secondary} />
                    <Text style={styles.qrCodeButtonText}>Mostrar QR Code</Text>
                </TouchableOpacity>
            )}

            {selectedPaymentMethod === 'cash' && (
                <View style={styles.cashInputContainer}>
                    <Text style={styles.cashInputLabel}>Valor em Dinheiro</Text>
                    <View style={styles.cashInputWrapper}>
                        <Text style={styles.cashPrefix}>R$</Text>
                        <TextInput
                            style={styles.cashInput}
                            value={cashAmount}
                            onChangeText={onCashAmountChange}
                            keyboardType="numeric"
                            placeholder="0,00"
                            placeholderTextColor="#999"
                        />
                    </View>
                    {cashAmount && grandTotal && (
                        <View style={styles.changeContainer}>
                            <Text style={styles.changeLabel}>Troco:</Text>
                            <Text style={styles.changeValue}>
                                R$ {(parseFloat(cashAmount.replace(',', '.')) - parseFloat(grandTotal)).toFixed(2)}
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {renderKeysModal()}
            <QRCodeModal
                visible={showQRCode}
                onClose={() => setShowQRCode(false)}
                selectedKey={selectedKey}
                isPix={selectedPaymentMethod === 'pix'}
                amount={grandTotal ? parseFloat(grandTotal) : 0}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.secondary,
        marginBottom: 12,
    },
    paymentMethodsCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    paymentMethodButton: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '48%',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    paymentMethodActive: {
        backgroundColor: COLORS.secondary,
    },
    paymentMethodText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#666',
    },
    paymentMethodTextActive: {
        color: '#fff',
    },
    cashInputContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginTop: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    cashInputLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    cashInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    cashPrefix: {
        fontSize: 16,
        color: '#666',
        marginRight: 4,
    },
    cashInput: {
        flex: 1,
        height: 46,
        fontSize: 16,
        color: '#333',
    },
    changeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    changeLabel: {
        fontSize: 14,
        color: '#666',
    },
    changeValue: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.secondary,
    },
    qrCodeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        marginTop: 12,
        borderWidth: 1,
        borderColor: COLORS.secondary,
    },
    qrCodeButtonText: {
        marginLeft: 8,
        fontSize: 14,
        color: COLORS.secondary,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.secondary,
    },
    keysList: {
        gap: 12,
    },
    keyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 12,
    },
    keyInfo: {
        flex: 1,
        marginRight: 8,
    },
    keyLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    keyValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    companyName: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
});