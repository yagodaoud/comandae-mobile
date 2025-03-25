import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';

const InsightsCard: React.FC = () => {
    return (
        <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
                <View>
                    <Text style={styles.insightTitle}>Insights Diários</Text>
                    <Text style={styles.insightSubtitle}>Resumo de desempenho</Text>
                </View>
            </View>

            <Text style={styles.percentageText}>76% das metas atingidas</Text>
            <View style={styles.progressContainer}>
                <View style={styles.progressBackground}>
                    <View style={[styles.progressFill, { width: '76%' }]} />
                </View>
            </View>
            <Text style={styles.trendText}>↑ 5% em relação a ontem</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    insightCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    insightHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    insightTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    insightSubtitle: {
        fontSize: 14,
        color: '#888',
    },
    percentageText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    trendText: {
        fontSize: 14,
        color: '#4CAF50',
        marginTop: 4,
    },
    progressContainer: {
        marginBottom: 8,
    },
    progressBackground: {
        height: 8,
        backgroundColor: '#eee',
        borderRadius: 4,
    },
    progressFill: {
        height: 8,
        backgroundColor: COLORS.primary,
        borderRadius: 4,
    },
});

export default InsightsCard;