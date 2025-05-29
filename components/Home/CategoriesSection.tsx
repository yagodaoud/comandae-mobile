import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import CategoryCard from './CategoryCard';
import { COLORS } from '@/constants/theme';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const CategoriesSection: React.FC = () => {
    const dishCount = useQuery(api.dishes.getDishCount);
    const lowStockCount = useQuery(api.dishes.getLowStockDishes, { threshold: 5 });
    const openSlipsCount = useQuery(api.slips.getOpenSlipsCount);
    const todayOrdersCount = useQuery(api.slips.getTodayOrdersCount);

    const formatCount = (count: number | undefined, singular: string, plural: string) => {
        if (count === undefined) return 'Carregando...';
        return `${count} ${count === 1 ? singular : plural}`;
    };

    return (
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
                    count={formatCount(dishCount, 'Prato no Menu', 'Pratos no Menu')}
                    title="Cardápio"
                    screenName="dishes"
                />
                <CategoryCard
                    icon={<Feather name="alert-triangle" size={24} color={COLORS.primary} />}
                    count={formatCount(lowStockCount, 'Item com Estoque Baixo', 'Itens com Estoque Baixo')}
                    title="Estoque"
                    screenName="stock"
                />
            </View>

            <View style={styles.categoryGrid}>
                <CategoryCard
                    icon={<Feather name="check-square" size={24} color={COLORS.primary} />}
                    count={formatCount(openSlipsCount, 'Comanda Aberta', 'Comandas Abertas')}
                    title="Comandas"
                    screenName="slips"
                />
                <CategoryCard
                    icon={<Feather name="shopping-bag" size={24} color={COLORS.primary} />}
                    count={formatCount(todayOrdersCount, 'Comanda fechada', 'Comandas fechadas')}
                    title="Pedidos"
                    screenName="payment"
                    navigationParams={{ filter: 'open' }}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
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
});

export default CategoriesSection;