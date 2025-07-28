import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { COLORS } from '@/constants/theme';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

const STATUS_OPTIONS = [
    { id: 'pending', label: 'Pendente' },
    { id: 'in_progress', label: 'Em preparo' },
    { id: 'waiting_for_dish', label: 'Aguardando prato' },
    { id: 'finished', label: 'Finalizado' },
    { id: 'canceled', label: 'Cancelado' },
];

interface OrderDetailModalProps {
    visible: boolean;
    onClose: () => void;
    orderId: string;
}

export default function OrderDetailModal({ visible, onClose, orderId }: OrderDetailModalProps) {
    const order = useQuery(api.menu.getTakeawayOrders, { status: undefined })?.find(o => o._id === orderId);
    const categories = useQuery(api.products.getProductCategories) ?? [];
    const products = useQuery(api.products.getProducts) ?? [];
    const allDishes = useQuery(api.menu.getDishes) ?? [];
    const dishMap = Object.fromEntries(allDishes.map(d => [d._id, d]));
    const categoryMap = Object.fromEntries(categories.map(c => [c._id, c]));
    const updateOrderStatus = useMutation(api.menu.updateOrderStatus);

    if (!order) return null;

    const handleStatusChange = async (status: string) => {
        try {
            await updateOrderStatus({ id: orderId, status });
            Alert.alert('Status atualizado!');
            onClose();
        } catch (err) {
            Alert.alert('Erro', 'Não foi possível atualizar o status.');
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <Text style={styles.title}>Detalhes do Pedido</Text>
                <ScrollView style={{ flex: 1 }}>
                    <Text style={styles.sectionTitle}>Cliente</Text>
                    <Text style={styles.label}>{order.customerName}</Text>
                    {order.generalObservation ? <Text style={styles.label}>Obs: {order.generalObservation}</Text> : null}
                    <Text style={styles.sectionTitle}>Marmitex</Text>
                    {order.marmitexList.map((m, idx) => (
                        <View key={idx} style={styles.marmitexCard}>
                            <Text style={styles.marmitexTitle}>{products.find(s => s._id === m.sizeProductId)?.name || 'Tamanho'}</Text>
                            {m.dishSelections.map((sel, i) => (
                                <Text key={i} style={styles.marmitexObs}>
                                    {categoryMap[sel.categoryId]?.name}: {sel.dishIds.map(did => dishMap[did]?.name).join(', ') || 'Nenhum'}
                                </Text>
                            ))}
                            {m.observation ? <Text style={styles.marmitexObs}>Obs: {m.observation}</Text> : null}
                            {m.extraPrice ? <Text style={styles.marmitexObs}>Extra: {m.extraPrice}</Text> : null}
                        </View>
                    ))}
                    <Text style={styles.sectionTitle}>Extras</Text>
                    {order.otherProducts.length === 0 && <Text style={{ color: '#888' }}>Nenhum extra.</Text>}
                    {order.otherProducts.map((e, idx) => (
                        <View key={idx} style={styles.marmitexCard}>
                            <Text style={styles.marmitexTitle}>{products.find(p => p._id === e.productId)?.name || 'Produto'}</Text>
                            <Text style={styles.marmitexObs}>Quantidade: {e.quantity}</Text>
                        </View>
                    ))}
                    <Text style={styles.sectionTitle}>Pagamento</Text>
                    <Text style={styles.label}>Método: {order.paymentInfo?.method}</Text>
                    <Text style={styles.label}>Valor: {order.paymentInfo?.amount}</Text>
                    <Text style={styles.sectionTitle}>Status</Text>
                    <Text style={styles.label}>{STATUS_OPTIONS.find(s => s.id === order.status)?.label || order.status}</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                        {STATUS_OPTIONS.map(opt => (
                            <TouchableOpacity
                                key={opt.id}
                                style={[styles.sizeButton, order.status === opt.id && styles.sizeButtonSelected]}
                                onPress={() => handleStatusChange(opt.id)}
                            >
                                <Text style={{ color: order.status === opt.id ? '#fff' : COLORS.primary }}>{opt.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.buttonText}>Fechar</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginTop: 16,
        marginBottom: 8,
    },
    label: {
        fontSize: 15,
        color: '#555',
        marginBottom: 6,
    },
    marmitexCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    marmitexTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    marmitexObs: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
    },
    sizeButton: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: COLORS.secondary,
        marginRight: 8,
    },
    sizeButtonSelected: {
        backgroundColor: COLORS.secondary,
    },
    closeButton: {
        backgroundColor: COLORS.secondary,
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 16,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
}); 