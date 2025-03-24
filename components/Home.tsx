import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TransparentHeader from '@/components/TransparentHeader';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

const CategoryCard = ({ icon, title, count, subtitle }) => {
    return (
        <View style={styles.categoryCard}>
            <View style={styles.categoryTop}>
                <View style={styles.categoryIconContainer}>
                    {icon}
                </View>
            </View>
            <Text style={styles.categoryCount}>{count}</Text>
            <Text style={styles.categoryTitle}>{title}</Text>
            {subtitle ? <Text style={styles.categorySubtitle}>{subtitle}</Text> : null}
            <View style={styles.categoryBottom}>
                <TouchableOpacity style={styles.actionButton}>
                    <Feather name="chevron-right" size={16} color={COLORS.primary} />
                </TouchableOpacity>
            </View>
        </View>
    );
};


export default function Home() {
    const insets = useSafeAreaInsets();

    const bottomPadding = 60 + (Platform.OS === 'ios' ? insets.bottom : 0);

    return (
        <View style={styles.container}>
            <TransparentHeader title="Home" />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ paddingBottom: bottomPadding }}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.welcomeTitle}>Bem vindo, {"Yago"}!</Text>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>Configurações</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>Planos</Text>
                    </TouchableOpacity>
                </View>

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

                <View style={styles.categoriesSection}>
                    <View style={styles.categoriesHeader}>
                        <Text style={styles.categoriesTitle}>Categorias</Text>
                        <TouchableOpacity style={styles.upgradePill}>
                            <Text style={styles.upgradeText}>PREMIUM</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.categoryGrid}>
                        <CategoryCard
                            icon={<Feather name="book" size={24} color={COLORS.primary} />}
                            count="5 Pratos no Menu"
                            title="Cardápio"
                        />
                        <CategoryCard
                            icon={<Feather name="shopping-bag" size={24} color={COLORS.primary} />}
                            count="2 Novos pedidos"
                            title="Pedidos"
                        />
                    </View>

                    <View style={styles.categoryGrid}>
                        <CategoryCard
                            icon={<Feather name="check-square" size={24} color={COLORS.primary} />}
                            count="9 Mesas Abertas"
                            title="Comandas"
                        />
                        <CategoryCard
                            icon={<Feather name="alert-triangle" size={24} color={COLORS.primary} />}
                            count="5 Itens com Estoque Baixo"
                            title="Estoque"
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    button: {
        backgroundColor: '#E79C4F',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginRight: 12,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
    },
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
    categoriesSection: {
        marginBottom: 24,
    },
    categoriesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    categoriesTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    upgradePill: {
        backgroundColor: '#333',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    upgradeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    categoryGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    categoryCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        width: '48%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    categoryTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    categoryIconContainer: {
        backgroundColor: '#f7f7f7',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryCount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    categoryTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 4,
    },
    categorySubtitle: {
        fontSize: 12,
        color: '#888',
        marginBottom: 12,
    },
    categoryBottom: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 12,
    },
    actionButton: {
        padding: 2,
    },
});