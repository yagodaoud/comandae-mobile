import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { COLORS } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface OrderCardProps {
    customerName: string;
    status: string;
    onPress: () => void;
}

const STATUS_COLORS: Record<string, string> = {
    pending: '#FFD600', // yellow
    in_progress: '#2196F3', // blue
    waiting_for_dish: '#FF9800', // orange
    finished: '#4CAF50', // green
    canceled: '#F44336', // red
};

export default function OrderCard({ customerName, status, onPress }: OrderCardProps) {
    return (
        <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]} onPress={onPress} android_ripple={{ color: '#eee' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={styles.customer}>{customerName}</Text>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[status] || '#ccc' }]}>
                    <Text style={styles.statusText}>{status.replace('_', ' ')}</Text>
                </View>
            </View>
            {/* Add more summary info here if available, e.g. main dish, time, etc. */}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    customer: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    status: {
        fontSize: 14,
        color: COLORS.secondary,
        marginTop: 4,
    },
    statusBadge: {
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 60,
    },
    statusText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 13,
        textTransform: 'capitalize',
    },
    cardPressed: {
        opacity: 0.85,
        backgroundColor: '#f0f0f0',
    },
}); 