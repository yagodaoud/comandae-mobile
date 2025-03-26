import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { OrderItem } from './OrderItem';
import { COLORS } from '@/constants/theme';

interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: string;
    total: string;
}

interface OrderSummaryProps {
    orderData: {
        id: string;
        table: string;
        items: OrderItem[];
        subtotal: string;
        tax: string;
        total: string;
    };
    tipPercentage: number;
    tipAmount: string;
    grandTotal: string;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
    orderData,
    tipPercentage,
    tipAmount,
    grandTotal
}) => {
    return (
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
                <Text style={styles.totalValue}>R$ {tipAmount}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalLabel}>Total</Text>
                <Text style={styles.grandTotalValue}>R$ {grandTotal}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
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
});