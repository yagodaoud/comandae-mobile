import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

interface CategoryCardProps {
    icon: React.ReactNode;
    count: string;
    title: string;
    subtitle?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
    icon,
    count,
    title,
    subtitle
}) => {
    return (
        <View style={styles.categoryCard}>
            <View style={styles.categoryTop}>
                <View style={styles.categoryIconContainer}>
                    {icon}
                </View>
            </View>
            <Text style={styles.categoryCount}>{count}</Text>
            <Text style={styles.categoryTitle}>{title}</Text>
            {subtitle && <Text style={styles.categorySubtitle}>{subtitle}</Text>}
            <View style={styles.categoryBottom}>
                <TouchableOpacity style={styles.actionButton}>
                    <Feather name="chevron-right" size={16} color={COLORS.primary} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
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

export default CategoryCard;