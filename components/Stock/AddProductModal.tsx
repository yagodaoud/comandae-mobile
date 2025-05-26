import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id, Doc } from '@/convex/_generated/dataModel';

type Category = Doc<"product_categories">;
type Product = Doc<"products">;

interface AddProductModalProps {
    visible: boolean;
    onClose: () => void;
    onProductAdded: () => void;
    editingProduct?: Product;
}

export default function AddProductModal({
    visible,
    onClose,
    onProductAdded,
    editingProduct,
}: AddProductModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [image, setImage] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Id<"product_categories"> | null>(null);
    const [hasInfiniteStock, setHasInfiniteStock] = useState(false);
    const [hasCustomPrice, setHasCustomPrice] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories = useQuery(api.products.getProductCategories) ?? [];
    const createProduct = useMutation(api.products.createProduct);
    const updateProduct = useMutation(api.products.updateProduct);

    // Reset form when modal opens/closes or editing product changes
    useEffect(() => {
        if (visible) {
            if (editingProduct) {
                setName(editingProduct.name);
                setDescription(editingProduct.description);
                setPrice(editingProduct.price.toString());
                setStock(editingProduct.stock.toString());
                setImage(editingProduct.image);
                setSelectedCategory(editingProduct.categoryId);
                setHasInfiniteStock(editingProduct.hasInfiniteStock);
                setHasCustomPrice(editingProduct.hasCustomPrice);
            } else {
                setName('');
                setDescription('');
                setPrice('');
                setStock('');
                setImage('');
                setSelectedCategory(null);
                setHasInfiniteStock(false);
                setHasCustomPrice(false);
            }
        }
    }, [visible, editingProduct]);

    const handleSubmit = async () => {
        if (!name || !price || (!hasInfiniteStock && !stock) || !selectedCategory) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        const priceNumber = parseFloat(price.replace(',', '.'));
        if (isNaN(priceNumber)) {
            alert('Preço inválido');
            return;
        }

        const stockNumber = hasInfiniteStock ? 0 : parseInt(stock);
        if (!hasInfiniteStock && isNaN(stockNumber)) {
            alert('Estoque inválido');
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingProduct) {
                await updateProduct({
                    id: editingProduct._id,
                    name,
                    description,
                    price: priceNumber,
                    stock: stockNumber,
                    image,
                    categoryId: selectedCategory,
                    hasInfiniteStock,
                    hasCustomPrice,
                });
            } else {
                await createProduct({
                    name,
                    description,
                    price: priceNumber,
                    stock: stockNumber,
                    image,
                    categoryId: selectedCategory,
                    hasInfiniteStock,
                    hasCustomPrice,
                });
            }
            onProductAdded();
            onClose();
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Erro ao salvar produto');
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
                <ScrollView style={styles.scrollView}>
                    <View style={styles.content}>
                        <View style={styles.header}>
                            <Text style={styles.title}>
                                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                            </Text>
                            <TouchableOpacity onPress={onClose}>
                                <Feather name="x" size={24} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Nome do Produto*</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Ex: Coca-Cola"
                                autoFocus
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Descrição</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Descrição do produto"
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Categoria*</Text>
                            <View style={styles.categoryList}>
                                {categories.map((category: Category) => (
                                    <TouchableOpacity
                                        key={category._id}
                                        style={[
                                            styles.categoryOption,
                                            selectedCategory === category._id && styles.categoryOptionSelected,
                                        ]}
                                        onPress={() => setSelectedCategory(category._id)}
                                    >
                                        <Text
                                            style={[
                                                styles.categoryOptionText,
                                                selectedCategory === category._id && styles.categoryOptionTextSelected,
                                            ]}
                                        >
                                            {category.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Preço*</Text>
                            <TextInput
                                style={styles.input}
                                value={price}
                                onChangeText={setPrice}
                                placeholder="0,00"
                                keyboardType="decimal-pad"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Estoque*</Text>
                            <TextInput
                                style={[styles.input, hasInfiniteStock && styles.inputDisabled]}
                                value={stock}
                                onChangeText={setStock}
                                placeholder="0"
                                keyboardType="numeric"
                                editable={!hasInfiniteStock}
                            />
                            <TouchableOpacity
                                style={styles.checkbox}
                                onPress={() => setHasInfiniteStock(!hasInfiniteStock)}
                            >
                                <Feather
                                    name={hasInfiniteStock ? 'check-square' : 'square'}
                                    size={20}
                                    color={COLORS.primary}
                                />
                                <Text style={styles.checkboxLabel}>Estoque Infinito</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>URL da Imagem</Text>
                            <TextInput
                                style={styles.input}
                                value={image}
                                onChangeText={setImage}
                                placeholder="https://..."
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.checkbox}
                            onPress={() => setHasCustomPrice(!hasCustomPrice)}
                        >
                            <Feather
                                name={hasCustomPrice ? 'check-square' : 'square'}
                                size={20}
                                color={COLORS.primary}
                            />
                            <Text style={styles.checkboxLabel}>Permitir Preço Personalizado</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.submitButtonText}>
                                {isSubmitting ? 'Salvando...' : editingProduct ? 'Salvar Alterações' : 'Criar Produto'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollView: {
        flex: 1,
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
    inputDisabled: {
        backgroundColor: '#f5f5f5',
        color: '#999',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    categoryList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryOption: {
        backgroundColor: '#fff',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    categoryOptionSelected: {
        backgroundColor: COLORS.secondary,
        borderColor: COLORS.white,
    },
    categoryOptionText: {
        fontSize: 14,
        color: '#333',
    },
    categoryOptionTextSelected: {
        color: '#fff',
    },
    checkbox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    checkboxLabel: {
        marginLeft: 8,
        fontSize: 14,
        color: '#555',
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