import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import CategoryCard from './CategoryCard';
import { COLORS } from '@/constants/theme';

const CategoriesSection: React.FC = () => {
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