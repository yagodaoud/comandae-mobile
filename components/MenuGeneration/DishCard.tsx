import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

interface DishCardProps {
    name: string;
    price: string;
    description: string;
    emoji: string;
    onEdit: (dish: any) => void;
    onDelete: (id: string) => void;
    id: string;
}

export const DishCard = ({ name, price, description, emoji, onEdit, onDelete, id }: DishCardProps) => {

    const handleDelete = () => {
        Alert.alert(
            "Confirmar exclusão",
            `Deseja realmente excluir "${name}"?`,
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Excluir",
                    onPress: () => onDelete(id),
                    style: "destructive"
                }
            ]
        );
    };

    return (
        <View style={styles.dishCard}>
            <View style={styles.dishCardHeader}>
                <Text style={styles.dishName}>{emoji} {name}</Text>
                <Text style={styles.dishPrice}>R$ {price}</Text>
            </View>
            <Text style={styles.dishDescription}>{description}</Text>
            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => onEdit({ id, name, price, description, emoji })}
                >
                    <Feather name="edit-2" size={16} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDelete}
                >
                    <Feather name="trash-2" size={16} color={COLORS.error || "#FF3B30"} />
                </TouchableOpacity>
            </View>
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
        marginBottom: 8,
    },
    actionsContainer: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        flexDirection: 'row',
    },
    editButton: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    deleteButton: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    }
})