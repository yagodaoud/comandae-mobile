import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import TransparentHeader from '@/components/TransparentHeader';
const orderData = {
    id: '1234',
    table: 'Mesa 5',
    items: [
        { id: '1', name: 'Filé Mignon', quantity: 2, price: '62,90', total: '125,80' },
        { id: '2', name: 'Coca-Cola', quantity: 3, price: '8,90', total: '26,70' },
        { id: '3', name: 'Batata Frita', quantity: 1, price: '18,90', total: '18,90' },
        { id: '4', name: 'Pudim', quantity: 2, price: '12,90', total: '25,80' },
    ],
    subtotal: '197,20',
    tax: '19,72',
    total: '216,92',
};
const paymentMethods = [
    { id: 'cash', name: 'Dinheiro', icon: 'dollar-sign' },
    { id: 'credit', name: 'Cartão de Crédito', icon: 'credit-card' },
    { id: 'debit', name: 'Cartão de Débito', icon: 'credit-card' },
    { id: 'pix', name: 'PIX', icon: 'smartphone' },
];

const OrderItem = ({ name, quantity, price, total }) => {
    return (
        <View style={styles.orderItem}>
            <View style={styles.orderItemDetails}>
                <Text style={styles.orderItemName}>{name}</Text>
                <Text style={styles.orderItemQuantity}>{quantity}x R$ {price}</Text>
            </View>
            <Text style={styles.orderItemTotal}>R$ {total}</Text>
        </View>
    );
};

export default function Payment() {
    const insets = useSafeAreaInsets();
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('credit');
    const [tipPercentage, setTipPercentage] = useState(10);
    const [cashAmount, setCashAmount] = useState('');
    const [showChangeModal, setShowChangeModal] = useState(false);

    const tipAmount = parseFloat(orderData.total.replace(',', '.')) * (tipPercentage / 100);
    const formattedTipAmount = tipAmount.toFixed(2).replace('.', ',');

    const grandTotal = (parseFloat(orderData.total.replace(',', '.')) + tipAmount).toFixed(2).replace('.', ',');

    const calculateChange = () => {
        if (!cashAmount) return '0,00';
        const change = parseFloat(cashAmount.replace(',', '.')) - parseFloat(grandTotal.replace(',', '.'));
        return change > 0 ? change.toFixed(2).replace('.', ',') : '0,00';
    };

    return (
        <View style={styles.container}>
            <TransparentHeader
                title="Pagamento"
                backButton={true}
                onBackPress={() => console.log('Navigate back')}
            />

            <View style={styles.orderInfoCard}>
                <View style={styles.orderHeader}>
                    <Text style={styles.orderNumber}>Comanda #{orderData.id}</Text>
                    <Text style={styles.tableNumber}>{orderData.table}</Text>
                </View>
            </View>

            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Resumo do Pedido</Text>
                <View style={styles.orderSummaryCard}>
                    <FlatList
                        data={orderData.items}
                        renderItem={({ item }) => (
                            <OrderItem
                                name={item.name}
                                quantity={item.quantity}
                                price={item.price}
                                total={item.total}
                            />
                        )}
                        keyExtractor={item => item.id}
                        scrollEnabled={false}
                    />

                    <View style={styles.divider} />

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Subtotal</Text>
                        <Text style={styles.totalValue}>R$ {orderData.subtotal}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Taxa de Serviço (10%)</Text>
                        <Text style={styles.totalValue}>R$ {orderData.tax}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Gorjeta ({tipPercentage}%)</Text>
                        <Text style={styles.totalValue}>R$ {formattedTipAmount}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.grandTotalRow}>
                        <Text style={styles.grandTotalLabel}>Total</Text>
                        <Text style={styles.grandTotalValue}>R$ {grandTotal}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Gorjeta</Text>
                <View style={styles.tipCard}>
                    <View style={styles.tipButtonsContainer}>
                        {[0, 5, 10, 15, 20].map((percentage) => (
                            <TouchableOpacity
                                key={percentage}
                                style={[
                                    styles.tipButton,
                                    tipPercentage === percentage && styles.tipButtonActive
                                ]}
                                onPress={() => setTipPercentage(percentage)}
                            >
                                <Text
                                    style={[
                                        styles.tipButtonText,
                                        tipPercentage === percentage && styles.tipButtonTextActive
                                    ]}
                                >
                                    {percentage}%
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Método de Pagamento</Text>
                <View style={styles.paymentMethodsCard}>
                    {paymentMethods.map((method) => (
                        <TouchableOpacity
                            key={method.id}
                            style={[
                                styles.paymentMethodButton,
                                selectedPaymentMethod === method.id && styles.paymentMethodActive
                            ]}
                            onPress={() => setSelectedPaymentMethod(method.id)}
                        >
                            <Feather
                                name={method.icon}
                                size={20}
                                color={selectedPaymentMethod === method.id ? '#fff' : '#666'}
                            />
                            <Text
                                style={[
                                    styles.paymentMethodText,
                                    selectedPaymentMethod === method.id && styles.paymentMethodTextActive
                                ]}
                            >
                                {method.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {selectedPaymentMethod === 'cash' && (
                    <View style={styles.cashInputContainer}>
                        <Text style={styles.cashInputLabel}>Valor Recebido:</Text>
                        <View style={styles.cashInputWrapper}>
                            <Text style={styles.cashPrefix}>R$</Text>
                            <TextInput
                                style={styles.cashInput}
                                value={cashAmount}
                                onChangeText={setCashAmount}
                                keyboardType="numeric"
                                placeholder="0,00"
                            />
                        </View>

                        {cashAmount && (
                            <View style={styles.changeContainer}>
                                <Text style={styles.changeLabel}>Troco:</Text>
                                <Text style={styles.changeValue}>R$ {calculateChange()}</Text>
                            </View>
                        )}
                    </View>
                )}
            </View>

            <View style={[styles.buttonContainer, { bottom: insets.bottom > 0 ? insets.bottom : 16 }]}>
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => console.log('Cancel payment')}
                >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() => console.log('Confirm payment')}
                >
                    <Text style={styles.confirmButtonText}>Finalizar Pagamento</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    orderInfoCard: {
        margin: 16,
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    tableNumber: {
        fontSize: 14,
        color: '#666',
    },
    sectionContainer: {
        marginHorizontal: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        paddingLeft: 4,
    },
    orderSummaryCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    orderItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    orderItemDetails: {
        flex: 1,
    },
    orderItemName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    orderItemQuantity: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    orderItemTotal: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 12,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 4,
    },
    totalLabel: {
        fontSize: 14,
        color: '#666',
    },
    totalValue: {
        fontSize: 14,
        color: '#333',
    },
    grandTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 4,
    },
    grandTotalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    grandTotalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    tipCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    tipButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    tipButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginHorizontal: 4,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
    },
    tipButtonActive: {
        backgroundColor: COLORS.secondary,
    },
    tipButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
    },
    tipButtonTextActive: {
        color: '#fff',
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
        fontWeight: '600',
        color: '#333',
    },
    changeValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    cancelButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        marginRight: 8,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    confirmButton: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        marginLeft: 8,
        borderRadius: 8,
        backgroundColor: COLORS.secondary,
    },
    confirmButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
});