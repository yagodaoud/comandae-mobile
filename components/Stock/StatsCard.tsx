import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatsCardProps {
    totalProducts: number;
    totalCategories: number;
    lowStock: number;
}

const StatsCard: React.FC<StatsCardProps> = ({
    totalProducts,
    totalCategories,
    lowStock
}) => {
    return (
        <View style={styles.statsCard}>
            <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalProducts}</Text>
                <Text style={styles.statLabel}>Produtos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalCategories}</Text>
                <Text style={styles.statLabel}>Categorias</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
                <Text style={[
                    styles.statValue,
                    lowStock > 0 && { color: '#F44336' }
                ]}>
                    {lowStock}
                </Text>
                <Text style={[
                    styles.statLabel,
                    lowStock > 0 && { color: '#F44336' }
                ]}>
                    Baixo Estoque
                </Text>
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
});

export default StatsCard;