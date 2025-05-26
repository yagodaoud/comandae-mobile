import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

interface AddItemModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectProduct: () => void;
    onSelectCategory: () => void;
}

export default function AddItemModal({
    visible,
    onClose,
    onSelectProduct,
    onSelectCategory,
}: AddItemModalProps) {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Adicionar Item</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Feather name="x" size={24} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.option}
                        onPress={() => {
                            onClose();
                            onSelectProduct();
                        }}
                    >
                        <Feather name="box" size={24} color={COLORS.primary} />
                        <Text style={styles.optionText}>Novo Produto</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.option}
                        onPress={() => {
                            onClose();
                            onSelectCategory();
                        }}
                    >
                        <Feather name="tag" size={24} color={COLORS.primary} />
                        <Text style={styles.optionText}>Nova Categoria</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        width: '80%',
        maxWidth: 400,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        marginBottom: 12,
    },
    optionText: {
        fontSize: 16,
        marginLeft: 12,
        color: '#333',
    },
}); 