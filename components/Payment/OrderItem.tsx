import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface OrderItemProps {
    name: string;
    quantity: number;
    price: string;
    total: string;
}

export const OrderItem: React.FC<OrderItemProps> = ({
    name,
    quantity,
    price,
    total
}) => {
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

const styles = StyleSheet.create({
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
});