import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface AddCategoryModalProps {
    visible: boolean;
    onClose: () => void;
    onCategoryAdded: () => void;
    currentMaxOrder: number;
}

export default function AddCategoryModal({
    visible,
    onClose,
    onCategoryAdded,
    currentMaxOrder,
}: AddCategoryModalProps) {
    const [name, setName] = useState('');
    const [order, setOrder] = useState(String(currentMaxOrder + 1));
    const [isSubmitting, setIsSubmitting] = useState(false);

    const createCategory = useMutation(api.menu.createDishCategory);

    const handleSubmit = async () => {
        if (!name || !order) {
            alert('Por favor, preencha todos os campos');
            return;
        }

        const orderNumber = parseInt(order);
        if (isNaN(orderNumber)) {
            alert('Ordem deve ser um número válido');
            return;
        }

        setIsSubmitting(true);
        try {
            await createCategory({
                name,
                order: orderNumber,
            });
            onCategoryAdded();
            onClose();
            setName('');
            setOrder(String(currentMaxOrder + 1));
        } catch (error) {
            console.error('Error creating category:', error);
            alert('Erro ao criar categoria');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Nova Categoria</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Feather name="x" size={24} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Nome da Categoria*</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Ex: Entradas"
                            autoFocus
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Ordem de Exibição*</Text>
                        <TextInput
                            style={styles.input}
                            value={order}
                            onChangeText={setOrder}
                            placeholder="Número para ordenação"
                            keyboardType="numeric"
                        />
                        <Text style={styles.hintText}>
                            Número que define a ordem na lista (menor aparece primeiro)
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.submitButtonText}>
                            {isSubmitting ? 'Criando...' : 'Criar Categoria'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        padding: 20,
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
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#555',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    hintText: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    submitButton: {
        backgroundColor: COLORS.secondary,
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 16,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});