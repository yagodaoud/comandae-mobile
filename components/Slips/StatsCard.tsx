import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatsCardProps {
    total: number;
    totalValue: string;
    longCount: number;
}

export const StatsCard: React.FC<StatsCardProps> = ({
    total,
    totalValue,
    longCount
}) => {
    return (
        <View style={styles.statsCard}>
            <View style={styles.statItem}>
                <Text style={styles.statValue}>{total}</Text>
                <Text style={styles.statLabel}>Comandas</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
                <Text style={styles.statValue}>{longCount}</Text>
                <Text style={styles.statLabel}>Aguardando</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
                <Text style={styles.statValue}>R$ {totalValue}</Text>
                <Text style={styles.statLabel}>Total</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    statsCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
        borderRadius: 12,
        paddingVertical: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    statLabel: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: '70%',
        backgroundColor: '#e0e0e0',
        alignSelf: 'center',
    },
    comandasGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingTop: 8,
    },
})
