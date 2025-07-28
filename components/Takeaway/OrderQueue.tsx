import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, Alert } from 'react-native';
import { COLORS } from '@/constants/theme';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import OrderCard from './OrderCard';
import AddOrderModal from './AddOrderModal';
import OrderDetailModal from './OrderDetailModal';
import { MaterialIcons } from '@expo/vector-icons';

const FILTER_OPTIONS = [
    { id: 'pending', label: 'Pendentes', statuses: ['pending', 'in_progress', 'waiting_for_dish'] },
    { id: 'finished', label: 'Finalizados', statuses: ['finished', 'canceled'] },
];

export default function OrderQueue() {
    const [activeFilter, setActiveFilter] = useState('pending');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const allOrders = useQuery(api.menu.getTakeawayOrders, { status: undefined }) ?? [];
    const prevOrderCount = useRef(allOrders.length);

    useEffect(() => {
        if (allOrders.length > prevOrderCount.current) {
            if (typeof window !== 'undefined' && window.Audio) {
                try {
                    const audio = new window.Audio('/beep.mp3');
                    audio.play();
                } catch { }
            } else if (typeof window !== 'undefined') {
                window.navigator.vibrate?.(200);
            }
            Alert.alert('Novo pedido', 'Um novo pedido foi adicionado à fila!');
        }
        prevOrderCount.current = allOrders.length;
    }, [allOrders.length]);

    // Filter orders based on activeFilter
    const filterStatuses = FILTER_OPTIONS.find(opt => opt.id === activeFilter)?.statuses || [];
    const orders = allOrders.filter(order => filterStatuses.includes(order.status));

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Fila de Marmitex</Text>
            <View style={styles.filterChipsContainer}>
                {FILTER_OPTIONS.map(opt => (
                    <TouchableOpacity
                        key={opt.id}
                        style={[styles.chip, activeFilter === opt.id && styles.chipActive]}
                        onPress={() => setActiveFilter(opt.id)}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.chipText, activeFilter === opt.id && styles.chipTextActive]}>{opt.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <FlatList
                data={orders}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                    <OrderCard
                        customerName={item.customerName}
                        status={item.status}
                        onPress={() => setSelectedOrderId(item._id)}
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="inbox" size={56} color="#ccc" style={{ marginBottom: 12 }} />
                        <Text style={styles.emptyText}>Nenhum pedido nesta fila.</Text>
                    </View>
                }
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 80 }}
            />
            <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)}>
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
            <AddOrderModal visible={showAddModal} onClose={() => setShowAddModal(false)} />
            <OrderDetailModal visible={!!selectedOrderId} onClose={() => setSelectedOrderId(null)} orderId={selectedOrderId || ''} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 16,
    },
    filterChips: {
        marginBottom: 16,
        flexGrow: 0,
    },
    filterChipsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    chip: {
        backgroundColor: '#f5f5f5',
        borderRadius: 24,
        paddingHorizontal: 18,
        paddingVertical: 10,
        marginRight: 0,
        marginLeft: 0,
        marginVertical: 4,
        borderWidth: 1,
        borderColor: '#eee',
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 2,
        elevation: 1,
    },
    chipActive: {
        backgroundColor: COLORS.secondary,
        borderColor: COLORS.secondary,
    },
    chipText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 15,
    },
    chipTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    fab: {
        position: 'absolute',
        right: 24,
        bottom: 90,
        backgroundColor: COLORS.secondary,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    fabText: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        marginTop: -2,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 64,
    },
    emptyText: {
        color: '#888',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
}); 