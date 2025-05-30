import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { COLORS } from '@/constants/theme';

const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
};

const InsightsCard: React.FC = () => {
    const dailyGoalConfig = useQuery(api.configurations.getConfig, { name: 'daily_goal' });
    const dailyProgress = useQuery(api.slips.getDailyProgress);

    const dailyGoal = dailyGoalConfig ? parseFloat(dailyGoalConfig.value) : 0;
    const currentProgress = dailyProgress?.todayTotal || 0;
    const yesterdayProgress = dailyProgress?.yesterdayTotal || 0;

    const percentage = dailyGoal > 0 ? Math.round((currentProgress / dailyGoal) * 100) : 0;
    const trend = dailyGoal > 0 && yesterdayProgress > 0
        ? Math.round((currentProgress / dailyGoal) * 100) - Math.round((yesterdayProgress / dailyGoal) * 100)
        : 0;

    const averageTicketToday = dailyProgress?.averageTicketToday || 0;
    const averageTicketYesterday = dailyProgress?.averageTicketYesterday || 0;
    const averageTicketTrend = averageTicketYesterday > 0
        ? ((averageTicketToday - averageTicketYesterday) / averageTicketYesterday) * 100
        : 0;

    const getTrendColor = (value: number) => {
        return value >= 0 ? '#4CAF50' : '#F44336';
    };

    const getTrendText = (value: number, hasYesterdayData: boolean) => {
        if (!hasYesterdayData) return 'Sem dados de ontem';
        return `${value >= 0 ? '↑' : '↓'} ${Math.abs(Math.round(value))}% em relação a ontem`;
    };

    return (
        <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
                <View>
                    <Text style={styles.insightTitle}>Insights Diários</Text>
                    <Text style={styles.insightSubtitle}>Resumo de desempenho</Text>
                </View>
            </View>

            <Text style={styles.percentageText}>{percentage}% da meta atingida</Text>
            <View style={styles.progressContainer}>
                <View style={styles.progressBackground}>
                    <View style={[styles.progressFill, { width: `${percentage}%` }]} />
                </View>
            </View>
            <View style={styles.detailsContainer}>
                <View>
                    <Text style={[styles.trendText, { color: getTrendColor(trend) }]}>
                        {getTrendText(trend, yesterdayProgress > 0)}
                    </Text>
                    {/* <Text style={styles.ticketText}>
                        Ticket médio: {formatCurrency(averageTicketToday)}
                        {averageTicketYesterday > 0 && (
                            <Text style={[styles.trendText, { color: getTrendColor(averageTicketTrend), marginLeft: 4 }]}>
                                ({averageTicketTrend >= 0 ? '↑' : '↓'} {Math.abs(Math.round(averageTicketTrend))}%)
                            </Text>
                        )}
                    </Text> */}
                </View>
                <Text style={styles.amountText}>
                    {formatCurrency(currentProgress)} de {formatCurrency(dailyGoal)}
                </Text>
            </View>
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
    detailsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginTop: 8,
    },
    trendText: {
        fontSize: 14,
    },
    ticketText: {
        fontSize: 14,
        color: COLORS.gray,
        marginTop: 4,
    },
    amountText: {
        fontSize: 14,
        color: COLORS.gray,
        textAlign: 'right',
    },
});

export default InsightsCard;