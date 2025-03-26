import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';

interface SlipCardProps {
    table: string;
    items: number;
    total: string;
    time: string;
    status: 'open' | 'closed';
    onPress: () => void;
}

export const SlipCard: React.FC<SlipCardProps> = ({
    table,
    total,
    time,
    status,
    onPress
}) => {
    const getStatusColor = () => {
        return status === 'open' ? COLORS.secondary : '#4CAF50';
    };

    const getStatusText = () => {
        return status === 'open' ? 'Aberto' : 'Fechado';
    };

    return (
        <TouchableOpacity
            style={[styles.slipCard, { borderLeftColor: getStatusColor() }]}
            onPress={onPress}
        >
            <View style={styles.slipHeader}>
                <Text style={styles.slipTitle}>{table}</Text>
                <View style={[styles.timeContainer]}>
                    <Text style={styles.timeText}>{time}</Text>
                    <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]}>
                        <Text style={styles.statusText}>{getStatusText()}</Text>
                    </View>
                </View>
            </View>
            <Text style={styles.slipTotal}>Total: R$ {total}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    slipCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        borderLeftWidth: 4,
    },
    slipHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    timeContainer: {
        alignItems: 'flex-end',
    },
    statusIndicator: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '500',
        color: '#fff',
    },
    slipTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    timeText: {
        fontSize: 12,
        color: '#666',
    },
    slipTotal: {
        fontSize: 14,
        color: '#666',
    },
});