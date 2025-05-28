import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

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

export const PaymentMethodSelector = ({
    paymentMethods,
    selectedPaymentMethod,
    onSelectPaymentMethod,
    cashAmount,
    onCashAmountChange,
    grandTotal,
}: PaymentMethodSelectorProps) => {
    const renderIcon = (method: PaymentMethod) => {
        if (method.iconType === 'material') {
            return <MaterialCommunityIcons name={method.icon} size={20} color={selectedPaymentMethod === method.id ? '#fff' : '#666'} />;
        }
        return <Feather name={method.icon} size={20} color={selectedPaymentMethod === method.id ? '#fff' : '#666'} />;
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
});