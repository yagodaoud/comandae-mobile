import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id, Doc } from '@/convex/_generated/dataModel';
import StepIndicator from './StepIndicator';

type Product = Doc<"products">;
type Category = Doc<"product_categories">;

interface AddSlipModalProps {
    visible: boolean;
    onClose: () => void;
    onSlipAdded: () => void;
    editingSlip: { id: Id<"slips">; table: string } | null;
}

type Step = 'table' | 'products' | 'review';

interface SlipItem {
    productId: Id<"products">;
    quantity: number;
    customPrice?: number;
}

export default function AddSlipModal({
    visible,
    onClose,
    onSlipAdded,
    editingSlip,
}: AddSlipModalProps) {
    const [currentStep, setCurrentStep] = useState<Step>('table');
    const [table, setTable] = useState('');
    const [items, setItems] = useState<SlipItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState('');
    const [customPrice, setCustomPrice] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tableError, setTableError] = useState('');
    const [isCheckingTable, setIsCheckingTable] = useState(false);

    const products = useQuery(api.products.getProducts) ?? [];
    const categories = useQuery(api.products.getCategories) ?? [];
    const existingSlip = useQuery(api.slips.getSlips, { table: table || undefined }) ?? [];
    const createSlip = useMutation(api.slips.createSlip);
    const updateSlip = useMutation(api.slips.updateSlip);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (visible) {
            if (editingSlip) {
                setTable(editingSlip.table);
                setCurrentStep('products');
                // Load existing items
                const slip = existingSlip.find(s => s._id === editingSlip.id);
                if (slip) {
                    setItems(slip.items);
                }
            } else {
                setCurrentStep('table');
                setTable('');
                setItems([]);
            }
            setSelectedProduct(null);
            setQuantity('');
            setCustomPrice('');
            setTableError('');
            setIsCheckingTable(false);
        }
    }, [visible, editingSlip, existingSlip]);

    const handleAddItem = () => {
        if (!selectedProduct || !quantity) return;

        const quantityNum = parseFloat(quantity.replace(',', '.'));
        if (isNaN(quantityNum) || quantityNum <= 0) {
            alert('Quantidade inválida');
            return;
        }

        const customPriceNum = customPrice ? parseFloat(customPrice.replace(',', '.')) : undefined;
        if (customPrice && (isNaN(customPriceNum!) || customPriceNum! <= 0)) {
            alert('Preço personalizado inválido');
            return;
        }

        // Check if product already exists in items
        const existingItemIndex = items.findIndex(item => item.productId === selectedProduct._id);

        if (existingItemIndex >= 0) {
            // Update existing item quantity
            const updatedItems = [...items];
            updatedItems[existingItemIndex] = {
                ...updatedItems[existingItemIndex],
                quantity: updatedItems[existingItemIndex].quantity + quantityNum,
                // Keep the existing custom price if any
            };
            setItems(updatedItems);
        } else {
            // Add new item
            setItems([...items, {
                productId: selectedProduct._id,
                quantity: quantityNum,
                customPrice: customPriceNum,
            }]);
        }

        setSelectedProduct(null);
        setQuantity('');
        setCustomPrice('');
    };

    const handleUpdateQuantity = (index: number, delta: number) => {
        const updatedItems = [...items];
        const newQuantity = updatedItems[index].quantity + delta;

        if (newQuantity <= 0) {
            handleRemoveItem(index);
            return;
        }

        updatedItems[index] = {
            ...updatedItems[index],
            quantity: newQuantity,
        };
        setItems(updatedItems);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!table || items.length === 0) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        if (tableError) {
            alert('Por favor, corrija os erros antes de continuar');
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingSlip) {
                await updateSlip({
                    id: editingSlip.id,
                    items,
                });
            } else {
                await createSlip({
                    table,
                    items,
                });
            }
            onSlipAdded();
            onClose();
        } catch (error) {
            console.error('Error saving slip:', error);
            alert('Erro ao salvar comanda');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStepNumber = (step: Step): number => {
        switch (step) {
            case 'table': return 1;
            case 'products': return 2;
            case 'review': return 3;
        }
    };

    const handleNextStep = () => {
        if (!table) {
            setTableError('Por favor, insira um número de mesa');
            return;
        }

        // Skip validation if we're editing the same table
        if (editingSlip && table === editingSlip.table) {
            setCurrentStep('products');
            return;
        }

        // Check if table is already in use
        const existingSlipWithTable = existingSlip.find(s => s.table === table);
        if (existingSlipWithTable && (!editingSlip || existingSlipWithTable._id !== editingSlip.id)) {
            setTableError('Esta comanda já está em uso');
            return;
        }

        setTableError('');
        setCurrentStep('products');
    };

    const renderTableStep = () => (
        <View style={styles.step}>
            <Text style={styles.stepTitle}>Número da Comanda</Text>
            <TextInput
                style={[styles.input, tableError && styles.inputError]}
                value={table}
                onChangeText={setTable}
                placeholder="Ex: 1"
                autoFocus
                keyboardType="numeric"
                maxLength={3}
            />
            {tableError ? (
                <Text style={styles.errorText}>{tableError}</Text>
            ) : null}
            <TouchableOpacity
                style={[
                    styles.nextButton,
                    !table && styles.nextButtonDisabled
                ]}
                onPress={handleNextStep}
                disabled={!table}
            >
                <Text style={styles.nextButtonText}>Próximo</Text>
                <Feather name="arrow-right" size={20} color="#fff" />
            </TouchableOpacity>
        </View>
    );

    const renderProductsStep = () => {
        // Group products by category
        const productsByCategory = categories.reduce((acc: Record<string, { category: Category; products: Product[] }>, category) => {
            const categoryProducts = products.filter(p => p.categoryId === category._id);
            if (categoryProducts.length > 0) {
                acc[category._id] = {
                    category,
                    products: categoryProducts
                };
            }
            return acc;
        }, {});

        return (
            <View style={styles.step}>
                <Text style={styles.stepTitle}>Adicionar Produtos</Text>

                <View style={styles.productSelector}>
                    <Text style={styles.label}>Produto*</Text>
                    <ScrollView style={styles.productList}>
                        {Object.entries(productsByCategory).map(([categoryId, { category, products }]) => (
                            <View key={categoryId} style={styles.categorySection}>
                                <Text style={styles.categoryTitle}>{category.name}</Text>
                                {products.map((product) => (
                                    <TouchableOpacity
                                        key={product._id}
                                        style={[
                                            styles.productOption,
                                            selectedProduct?._id === product._id && styles.productOptionSelected,
                                            !product.hasInfiniteStock && product.stock <= 0 && styles.productOptionDisabled,
                                        ]}
                                        onPress={() => setSelectedProduct(product)}
                                        disabled={!product.hasInfiniteStock && product.stock <= 0}
                                    >
                                        <View style={styles.productInfo}>
                                            <Text
                                                style={[
                                                    styles.productOptionText,
                                                    selectedProduct?._id === product._id && styles.productOptionTextSelected,
                                                    !product.hasInfiniteStock && product.stock <= 0 && styles.productOptionTextDisabled,
                                                ]}
                                            >
                                                {product.name}
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.productPrice,
                                                    selectedProduct?._id === product._id && styles.productPriceSelected,
                                                ]}
                                            >
                                                R$ {product.price.toFixed(2)}
                                            </Text>
                                        </View>
                                        {!product.hasInfiniteStock && product.stock <= 0 && (
                                            <Text style={styles.outOfStockText}>Sem estoque</Text>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.quantityInput}>
                    <Text style={styles.label}>Quantidade*</Text>
                    <TextInput
                        style={styles.input}
                        value={quantity}
                        onChangeText={setQuantity}
                        placeholder="0"
                        keyboardType="decimal-pad"
                    />
                </View>

                {selectedProduct?.hasCustomPrice && (
                    <View style={styles.customPriceInput}>
                        <Text style={styles.label}>Preço Personalizado</Text>
                        <TextInput
                            style={styles.input}
                            value={customPrice}
                            onChangeText={setCustomPrice}
                            placeholder="0,00"
                            keyboardType="decimal-pad"
                        />
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.addButton, (!selectedProduct || !quantity) && styles.addButtonDisabled]}
                    onPress={handleAddItem}
                    disabled={!selectedProduct || !quantity}
                >
                    <Text style={styles.addButtonText}>Adicionar Item</Text>
                </TouchableOpacity>

                {items.length > 0 && (
                    <View style={styles.itemsList}>
                        <Text style={styles.label}>Itens Adicionados</Text>
                        {items.map((item, index) => {
                            const product = products.find(p => p._id === item.productId);
                            return (
                                <View key={index} style={styles.itemRow}>
                                    <View style={styles.itemInfo}>
                                        <Text style={styles.itemName}>{product?.name}</Text>
                                        <Text style={styles.itemDetails}>
                                            {item.quantity} x R$ {item.customPrice?.toFixed(2) ?? product?.price.toFixed(2)}
                                        </Text>
                                    </View>
                                    <View style={styles.itemControls}>
                                        <TouchableOpacity
                                            onPress={() => handleUpdateQuantity(index, -1)}
                                            style={styles.quantityButton}
                                        >
                                            <Feather name="minus" size={16} color={COLORS.primary} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleUpdateQuantity(index, 1)}
                                            style={styles.quantityButton}
                                        >
                                            <Feather name="plus" size={16} color={COLORS.primary} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleRemoveItem(index)}
                                            style={styles.removeButton}
                                        >
                                            <Feather name="trash-2" size={20} color="#F44336" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}

                <View style={styles.stepButtons}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => setCurrentStep('table')}
                    >
                        <Feather name="arrow-left" size={20} color={COLORS.primary} />
                        <Text style={styles.backButtonText}>Voltar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.nextButton, items.length === 0 && styles.nextButtonDisabled]}
                        onPress={() => setCurrentStep('review')}
                        disabled={items.length === 0}
                    >
                        <Text style={styles.nextButtonText}>Próximo</Text>
                        <Feather name="arrow-right" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderReviewStep = () => {
        const total = items.reduce((sum, item) => {
            const product = products.find(p => p._id === item.productId);
            const price = item.customPrice ?? product?.price ?? 0;
            return sum + (price * item.quantity);
        }, 0);

        return (
            <View style={styles.step}>
                <Text style={styles.stepTitle}>Revisar Comanda</Text>

                <View style={styles.reviewSection}>
                    <Text style={styles.reviewLabel}>Mesa</Text>
                    <Text style={styles.reviewValue}>{table}</Text>
                </View>

                <View style={styles.reviewSection}>
                    <Text style={styles.reviewLabel}>Itens</Text>
                    {items.map((item, index) => {
                        const product = products.find(p => p._id === item.productId);
                        return (
                            <View key={index} style={styles.reviewItem}>
                                <Text style={styles.reviewItemName}>{product?.name}</Text>
                                <Text style={styles.reviewItemDetails}>
                                    {item.quantity} x R$ {item.customPrice?.toFixed(2) ?? product?.price.toFixed(2)}
                                </Text>
                            </View>
                        );
                    })}
                </View>

                <View style={styles.reviewSection}>
                    <Text style={styles.reviewLabel}>Total</Text>
                    <Text style={styles.reviewTotal}>R$ {total.toFixed(2)}</Text>
                </View>

                <View style={styles.stepButtons}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => setCurrentStep('products')}
                    >
                        <Feather name="arrow-left" size={20} color={COLORS.primary} />
                        <Text style={styles.backButtonText}>Voltar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.submitButtonText}>
                            {isSubmitting ? 'Salvando...' : 'Salvar Comanda'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
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
                <View style={styles.header}>
                    <Text style={styles.title}>
                        {editingSlip ? 'Editar Comanda' : 'Nova Comanda'}
                    </Text>
                    <TouchableOpacity onPress={onClose}>
                        <Feather name="x" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>

                <StepIndicator
                    currentStep={getStepNumber(currentStep)}
                    totalSteps={3}
                />

                <ScrollView style={styles.content}>
                    {currentStep === 'table' && renderTableStep()}
                    {currentStep === 'products' && renderProductsStep()}
                    {currentStep === 'review' && renderReviewStep()}
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    content: {
        flex: 1,
    },
    step: {
        padding: 20,
    },
    stepTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 16,
    },
    inputError: {
        borderColor: '#F44336',
    },
    errorText: {
        color: '#F44336',
        fontSize: 14,
        marginTop: -12,
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#555',
    },
    productSelector: {
        marginBottom: 20,
    },
    productList: {
        maxHeight: 300,
    },
    categorySection: {
        marginBottom: 20,
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    productOption: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    productOptionSelected: {
        backgroundColor: COLORS.secondary,
        borderColor: COLORS.secondary,
    },
    productOptionDisabled: {
        backgroundColor: '#f5f5f5',
        borderColor: '#ddd',
    },
    productOptionText: {
        fontSize: 16,
        color: '#333',
    },
    productOptionTextSelected: {
        color: '#fff',
    },
    productOptionTextDisabled: {
        color: '#999',
    },
    outOfStockText: {
        fontSize: 12,
        color: '#F44336',
        marginTop: 4,
    },
    quantityInput: {
        marginBottom: 20,
    },
    customPriceInput: {
        marginBottom: 20,
    },
    addButton: {
        backgroundColor: COLORS.secondary,
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginBottom: 20,
    },
    addButtonDisabled: {
        opacity: 0.6,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    itemsList: {
        marginBottom: 20,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        color: '#333',
    },
    itemDetails: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    removeButton: {
        padding: 8,
    },
    stepButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    backButtonText: {
        color: COLORS.primary,
        fontSize: 16,
        marginLeft: 8,
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.secondary,
        padding: 12,
        borderRadius: 8,
        paddingHorizontal: 20,
    },
    nextButtonDisabled: {
        opacity: 0.6,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    },
    submitButton: {
        backgroundColor: COLORS.secondary,
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        flex: 1,
        marginLeft: 16,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    reviewSection: {
        marginBottom: 24,
    },
    reviewLabel: {
        fontSize: 16,
        color: '#555',
        marginBottom: 8,
    },
    reviewValue: {
        fontSize: 18,
        color: '#333',
        fontWeight: '500',
    },
    reviewItem: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    reviewItemName: {
        fontSize: 16,
        color: '#333',
    },
    reviewItemDetails: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    reviewTotal: {
        fontSize: 24,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    checkingText: {
        color: '#666',
        fontSize: 14,
        marginTop: -12,
        marginBottom: 16,
    },
    productInfo: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    productPrice: {
        fontSize: 14,
        color: '#666',
    },
    productPriceSelected: {
        color: '#fff',
    },
    itemControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    quantityButton: {
        padding: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
    },
}); 