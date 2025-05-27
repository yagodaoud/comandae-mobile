import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { Doc, Id } from '@/convex/_generated/dataModel';

type Slip = Doc<"slips">;
type Product = Doc<"products">;

interface ViewSlipModalProps {
    visible: boolean;
    onClose: () => void;
    slip: Slip | null;
    products: Product[];
}

interface FormattedOrderItem {
    id: Id<"products"> | string; // Use string for key, Id for internal logic if needed
    name: string;
    quantity: number;
    price: string;
    total: string;
}

export default function ViewSlipModal({ visible, onClose, slip, products }: ViewSlipModalProps) {
    if (!slip) return null;

    const formatOrderItems = (items: { productId: Id<"products">; quantity: number; customPrice?: number }[], productList: Product[]): FormattedOrderItem[] => {
        return items.map((item, index) => {
            const product = productList.find(p => p._id === item.productId);
            // Use index as a fallback key if product not found, although product should exist
            const itemId = product ? product._id : `item-${index}`;
            const name = product ? product.name : 'Produto Desconhecido';
            const price = item.customPrice ?? (product ? product.price : 0);
            const total = price * item.quantity;

            return {
                id: itemId,
                name: name,
                quantity: item.quantity,
                price: price.toFixed(2).replace('.', ','),
                total: total.toFixed(2).replace('.', ','),
            };
        });
    };

    const formattedItems = formatOrderItems(slip.items, products);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Detalhes da Comanda {slip.table}</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Feather name="x" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Itens do Pedido:</Text>
                        {formattedItems.map(item => (
                            <View key={item.id} style={styles.itemRow}>
                                <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemTotal}>R$ {item.total}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Resumo:</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal:</Text>
                            <Text style={styles.summaryValue}>R$ {slip.total.toFixed(2).replace('.', ',')}</Text>
                        </View>
                        {slip.tipAmount !== undefined && ( // Only show tip if it exists
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Gorjeta:</Text>
                                <Text style={styles.summaryValue}>R$ {slip.tipAmount.toFixed(2).replace('.', ',')}</Text>
                            </View>
                        )}
                        {slip.finalTotal !== undefined && ( // Show final total if payment was processed
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Total Final:</Text>
                                <Text style={[styles.summaryValue, styles.finalTotalValue]}>R$ {slip.finalTotal.toFixed(2).replace('.', ',')}</Text>
                            </View>
                        )}
                    </View>

                    {/* Payment Details for closed slips */}
                    {!slip.isOpen && slip.paymentMethod && ( // Only show if closed and payment method exists
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Detalhes do Pagamento:</Text>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Método:</Text>
                                <Text style={styles.detailValue}>{slip.paymentMethod}</Text>
                            </View>
                            {typeof slip.cashAmount === 'number' && !isNaN(slip.cashAmount) && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Valor Recebido:</Text>
                                    <Text style={styles.detailValue}>R$ {slip.cashAmount.toFixed(2).replace('.', ',')}</Text>
                                </View>
                            )}
                            {slip.paymentTime !== undefined && ( // Show payment time if available
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Data/Hora:</Text>
                                    <Text style={styles.detailValue}>{new Date(slip.paymentTime).toLocaleString()}</Text>
                                </View>
                            )}
                        </View>
                    )}

                </ScrollView>

            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 10,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
    },
    itemQuantity: {
        fontSize: 14,
        color: '#666',
        marginRight: 10,
    },
    itemName: {
        flex: 1,
        fontSize: 14,
        color: '#333',
    },
    itemTotal: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#333',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    finalTotalValue: {
        color: COLORS.secondary,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
    },
    detailValue: {
        fontSize: 14,
        color: '#333',
    },
});