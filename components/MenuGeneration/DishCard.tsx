import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

interface DishCardProps {
    name: string;
    price: string;
    description: string;
    emoji: string;
    onEdit: (dish: any) => void;
    id: string;
}

export const DishCard = ({ name, price, description, emoji, onEdit, id }: DishCardProps) => {
    return (
        <View style={styles.dishCard}>
            <View style={styles.dishCardHeader}>
                <Text style={styles.dishName}>{emoji} {name}</Text>
                <Text style={styles.dishPrice}>R$ {price}</Text>
            </View>
            <Text style={styles.dishDescription}>{description}</Text>
            <TouchableOpacity 
                style={styles.editButton} 
                onPress={() => onEdit({ id, name, price, description, emoji })}
            >
                <Feather name="edit-2" size={16} color={COLORS.primary} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({

    dishCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        position: 'relative',
    },
    dishCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    dishName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    dishPrice: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.primary,
    },
    dishDescription: {
        fontSize: 14,
        color: '#666',
        paddingRight: 24,
    },
    editButton: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
})