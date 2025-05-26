import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id, Doc } from '@/convex/_generated/dataModel';

type Category = Doc<"product_categories">;

interface AddCategoryModalProps {
    visible: boolean;
    onClose: () => void;
    onCategoryAdded: () => void;
    editingCategory?: Category;
}

export default function AddCategoryModal({
    visible,
    onClose,
    onCategoryAdded,
    editingCategory,
}: AddCategoryModalProps) {
    const [name, setName] = useState('');
    const [order, setOrder] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories = useQuery(api.products.getProductCategories) ?? [];
    const createCategory = useMutation(api.products.createProductCategory);
    const updateCategory = useMutation(api.products.updateProductCategory);

    // Reset form when modal opens/closes or editing category changes
    useEffect(() => {
        if (visible) {
            if (editingCategory) {
                setName(editingCategory.name);
                setOrder(String(editingCategory.displaOrder ?? 0));
            } else {
                const maxOrder = categories.reduce((max, category) =>
                    Math.max(max, category.displaOrder ?? 0), 0);
                setName('');
                setOrder(String(maxOrder + 1));
            }
        }
    }, [visible, editingCategory, categories]);

    const handleSubmit = async () => {
        if (!name || !order) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        const orderNumber = parseInt(order);
        if (isNaN(orderNumber)) {
            alert('Ordem deve ser um número válido');
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingCategory) {
                await updateCategory({
                    id: editingCategory._id,
                    name,
                    displaOrder: orderNumber,
                });
            } else {
                await createCategory({
                    name,
                    displaOrder: orderNumber,
                });
            }
            onCategoryAdded();
            onClose();
            setName('');
            setOrder('');
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Erro ao salvar categoria');
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
                        <Text style={styles.title}>
                            {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                        </Text>
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
                            placeholder="Ex: Bebidas"
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
                            {isSubmitting ? 'Salvando...' : editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
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