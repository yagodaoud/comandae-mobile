import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS } from '@/constants/theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TransparentHeader from '@/components/TransparentHeader';
import { useRouter } from 'expo-router';
import { Svg, Path } from 'react-native-svg';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

const paymentColors = {
    cash: COLORS.secondary,
    pix: '#4caf50',
    bitcoin: '#f7931a',
    card: '#1976d2',
} as const;

const paymentLabels = {
    cash: 'Dinheiro',
    pix: 'PIX',
    bitcoin: 'Bitcoin',
    card: 'Cartão',
} as const;

const paymentIcons = {
    cash: <Feather name="dollar-sign" size={22} color="#fff" />,
    pix: <MaterialCommunityIcons name="qrcode-scan" size={22} color="#fff" />,
    bitcoin: <MaterialCommunityIcons name="bitcoin" size={22} color="#fff" />,
    card: <Feather name="credit-card" size={22} color="#fff" />,
} as const;

type PaymentType = keyof typeof paymentColors;

function getPieChartData(byType: Record<PaymentType, number>) {
    const total = Object.values(byType).reduce((a, b) => a + b, 0);
    let startAngle = 0;
    return (Object.entries(byType) as [PaymentType, number][]).map(([type, value]) => {
        const angle = total > 0 ? (value / total) * 360 : 0;
        const data = { type, value, startAngle, angle, color: paymentColors[type] };
        startAngle += angle;
        return data;
    });
}

function PieChart({ byType, size = 140, strokeWidth = 22 }: { byType: Record<PaymentType, number>; size?: number; strokeWidth?: number }) {
    const data = getPieChartData(byType);
    const radius = size / 2 - strokeWidth / 2;
    const center = size / 2;
    let cumulativeAngle = 0;

    return (
        <Svg width={size} height={size}>
            {data.map((slice, i) => {
                const startAngle = cumulativeAngle;
                const endAngle = cumulativeAngle + slice.angle;
                cumulativeAngle = endAngle;
                const largeArc = slice.angle > 180 ? 1 : 0;
                const x1 = center + radius * Math.cos((Math.PI * startAngle) / 180);
                const y1 = center + radius * Math.sin((Math.PI * startAngle) / 180);
                const x2 = center + radius * Math.cos((Math.PI * endAngle) / 180);
                const y2 = center + radius * Math.sin((Math.PI * endAngle) / 180);
                const d = `M${center},${center} L${x1},${y1} A${radius},${radius} 0 ${largeArc} 1 ${x2},${y2} Z`;
                return (
                    <Path
                        key={slice.type}
                        d={d}
                        fill={slice.color}
                        fillOpacity={0.85}
                        stroke="#fff"
                        strokeWidth={2}
                    />
                );
            })}
        </Svg>
    );
}

function formatBRL(value: number) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function ReportScreen() {
    const insets = useSafeAreaInsets();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const router = useRouter();

    const dateString = selectedDate.toISOString().slice(0, 10);
    const summary = useQuery(api.slips.getReportSummaryByDate, { date: dateString });
    const loading = summary === undefined;
    const total = summary?.total ?? 0;
    const byType: Record<PaymentType, number> = summary?.byType ?? { cash: 0, card: 0, pix: 0, bitcoin: 0 };

    const formattedDate = `${selectedDate.getDate().toString().padStart(2, '0')}/${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}/${selectedDate.getFullYear()}`;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <TransparentHeader
                title="Resumo do Dia"
                backButton={true}
                onBackPress={() => router.back()}
                icon={null}
            />
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                    <Feather name="calendar" size={18} color={COLORS.primary} />
                    <Text style={styles.dateText}>{formattedDate}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display="default"
                        onChange={(event, date) => {
                            setShowDatePicker(false);
                            if (date) setSelectedDate(date);
                        }}
                    />
                )}
            </View>
            <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Total do Dia</Text>
                {loading ? (
                    <ActivityIndicator color={COLORS.secondary} size="large" style={{ marginTop: 8 }} />
                ) : (
                    <Text style={styles.summaryValue}>{formatBRL(total)}</Text>
                )}
            </View>
            <View style={styles.cardsRow}>
                {(Object.keys(paymentLabels) as PaymentType[]).map(type => (
                    <View key={type} style={[styles.card, { backgroundColor: paymentColors[type] }]}>
                        <View style={styles.cardIcon}>{paymentIcons[type]}</View>
                        <Text style={styles.cardLabel}>{paymentLabels[type]}</Text>
                        {loading ? (
                            <ActivityIndicator color="#fff" size="small" style={{ marginTop: 8 }} />
                        ) : (
                            <Text style={styles.cardValue}>{formatBRL(byType[type])}</Text>
                        )}
                    </View>
                ))}
            </View>
            <View style={styles.pieChartContainer}>
                <Text style={styles.sectionTitle}>Distribuição dos Pagamentos</Text>
                {loading ? (
                    <ActivityIndicator color={COLORS.secondary} size="large" style={{ marginTop: 16 }} />
                ) : Object.values(byType).every(v => v === 0) ? (
                    <View style={{ minHeight: 100, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ color: '#888', fontSize: 16, marginTop: 16 }}>Nenhum pagamento registrado neste dia</Text>
                    </View>
                ) : (
                    <PieChart byType={byType} />
                )}
                <View style={styles.legendRow}>
                    {(Object.keys(paymentLabels) as PaymentType[]).map(type => (
                        <View key={type} style={styles.legendItem}>
                            <View style={[styles.legendColor, { backgroundColor: paymentColors[type] }]} />
                            <Text style={styles.legendLabel}>{paymentLabels[type]}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingHorizontal: 0,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        marginTop: 8,
        marginBottom: 8,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    dateText: {
        marginLeft: 8,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 18,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 2,
    },
    summaryLabel: {
        color: '#888',
        fontSize: 15,
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    cardsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginHorizontal: 10,
        marginBottom: 18,
        gap: 8,
    },
    card: {
        flexBasis: '47%',
        borderRadius: 14,
        padding: 16,
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    cardIcon: {
        marginBottom: 8,
        backgroundColor: 'rgba(0,0,0,0.08)',
        borderRadius: 20,
        padding: 8,
    },
    cardLabel: {
        color: '#fff',
        fontSize: 15,
        marginBottom: 2,
        fontWeight: '600',
    },
    cardValue: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    pieChartContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 20,
        marginTop: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 8,
        fontSize: 16,
    },
    legendRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 12,
        flexWrap: 'wrap',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 8,
        marginBottom: 4,
    },
    legendColor: {
        width: 14,
        height: 14,
        borderRadius: 7,
        marginRight: 6,
    },
    legendLabel: {
        fontSize: 13,
        color: '#333',
    },
}); 