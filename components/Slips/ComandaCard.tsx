import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import ActionMenu from './ActionMenu';
import { Id } from '@/convex/_generated/dataModel';

interface ComandaCardProps {
    id: Id<"slips">;
    table: string;
    items: number;
    total: string;
    time: string;
    status: 'recent' | 'medium' | 'long' | string;
    onPress: () => void;
}

export const ComandaCard: React.FC<ComandaCardProps> = ({
    id,
    table,
    items,
    total,
    time,
    status,
    onPress
}) => {
    const [showActions, setShowActions] = useState(false);
    const [actionPosition, setActionPosition] = useState({ x: 0, y: 0 });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'recent':
                return '#4CAF50'; // Green
            case 'medium':
                return '#FF9800'; // Orange
            case 'long':
                return '#F44336'; // Red
            default:
                return '#9E9E9E'; // Grey
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'recent':
                return 'Recente';
            case 'medium':
                return 'Intermediária';
            case 'long':
                return 'Atrasada';
            default:
                return 'Desconhecido';
        }
    };

    const handleLongPress = (event: any) => {
        const { pageX, pageY } = event.nativeEvent;
        setActionPosition({ x: pageX, y: pageY });
        setShowActions(true);
    };

    return (
        <>
            <TouchableOpacity
                style={[styles.comandaCard, { borderLeftColor: getStatusColor(status) }]}
                onPress={onPress}
                onLongPress={handleLongPress}
                delayLongPress={300}
            >
                <View style={styles.comandaHeader}>
                    <Text style={styles.comandaTitle}>{table}</Text>
                    <View style={[styles.timeIndicator, { backgroundColor: getStatusColor(status) }]}>
                        <Text style={styles.timeText}>{time}</Text>
                    </View>
                </View>
                <View style={styles.comandaContent}>
                    <View style={styles.commandDetail}>
                        <Feather name="shopping-bag" size={16} color="#888" />
                        <Text style={styles.commandDetailText}>{items} itens</Text>
                    </View>
                    <View style={styles.comandaDivider} />
                    <View style={styles.commandDetail}>
                        <Feather name="dollar-sign" size={16} color="#888" />
                        <Text style={styles.commandDetailText}>R$ {total}</Text>
                    </View>
                </View>
            </TouchableOpacity>

            <ActionMenu
                visible={showActions}
                position={actionPosition}
                onClose={() => setShowActions(false)}
                slipId={id}
            />
        </>
    );
};

const styles = StyleSheet.create({
    comandaCard: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        borderLeftWidth: 4,
    },
    comandaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    comandaTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    timeIndicator: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    timeText: {
        fontSize: 10,
        fontWeight: '500',
        color: '#fff',
    },
    comandaContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    commandDetail: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    commandDetailText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    comandaDivider: {
        width: 1,
        height: 16,
        backgroundColor: '#e0e0e0',
    },
});

