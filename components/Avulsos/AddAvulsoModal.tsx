import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput, ScrollView, KeyboardAvoidingView, Platform, LayoutAnimation, UIManager } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id, Doc } from '@/convex/_generated/dataModel';
import { parseBRL, formatBRL } from '@/utils/formatBRL';
import { ActionButtons } from '@/components/ActionButtons';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Product = Doc<"products">;

interface AddAvulsoModalProps {
    visible: boolean;
    onClose: () => void;
    avulso?: {
        _id: Id<'avulsos'>;
        description?: string;
        total: number;
        products?: AvulsoProduct[];
        extraAmount?: number;
        createdAt: number;
    } | null;
}

interface AvulsoProduct {
    productId: Id<"products">;
    quantity: number;
    price: number;
}

export default function AddAvulsoModal({ visible, onClose, avulso }: AddAvulsoModalProps) {
    const [description, setDescription] = useState('');
    const [totalValue, setTotalValue] = useState('');
    const [extraAmount, setExtraAmount] = useState('');
    const [selectedProducts, setSelectedProducts] = useState<AvulsoProduct[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState('');
    const [customPrice, setCustomPrice] = useState('');

    const products = useQuery(api.products.getProducts) ?? [];
    const categories = useQuery(api.products.getCategories) ?? [];
    const createAvulso = useMutation(api.avulsos.createAvulso);

    // Group products by category
    const productsByCategory = categories.reduce((acc: Record<string, { category: any; products: Product[] }>, category) => {
        const categoryProducts = products
            .filter(p => p.categoryId === category._id)
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
        if (categoryProducts.length > 0) {
            acc[category._id] = {
                category,
                products: categoryProducts
            };
        }
        return acc;
    }, {});

    // State for expanded categories
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

    const toggleCategory = (categoryId: string) => {
        LayoutAnimation.configureNext(
            LayoutAnimation.create(
                300,
                LayoutAnimation.Types.easeInEaseOut,
                LayoutAnimation.Properties.opacity
            )
        );
        setExpandedCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId],
        }));
    };

    // Refactored: single-select product logic
    const handleSelectProduct = (product: Product) => {
        setSelectedProduct(product);
        setQuantity('');
        setCustomPrice('');
    };

    // Add item logic (single product at a time)
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
        // Always add as a new item (no stacking in Avulso)
        setSelectedProducts([...selectedProducts, {
            productId: selectedProduct._id,
            quantity: quantityNum,
            price: customPriceNum ?? selectedProduct.price,
        }]);
        setSelectedProduct(null);
        setQuantity('');
        setCustomPrice('');
    };

    const handleUpdateQuantity = (index: number, delta: number) => {
        const updatedProducts = [...selectedProducts];
        const newQuantity = Math.round((updatedProducts[index].quantity + delta) * 1000) / 1000;
        if (newQuantity <= 0) {
            handleRemoveItem(index);
            return;
        }
        updatedProducts[index] = {
            ...updatedProducts[index],
            quantity: newQuantity,
        };
        setSelectedProducts(updatedProducts);
    };

    const handleRemoveItem = (index: number) => {
        setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
    };

    const calculateProductsTotal = () => {
        return selectedProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const calculateFinalTotal = () => {
        const productsTotal = calculateProductsTotal();
        const extraAmountNum = extraAmount ? parseBRL(extraAmount) : 0;
        const totalValueNum = totalValue ? parseBRL(totalValue) : 0;
        // If totalValue is provided, use it; otherwise use products + extra
        return totalValueNum > 0 ? totalValueNum : (productsTotal + extraAmountNum);
    };

    // Prefill state if editing
    React.useEffect(() => {
        if (visible && avulso) {
            setDescription(avulso.description || '');
            setTotalValue(avulso.total ? formatBRL(avulso.total) : '');
            setExtraAmount(avulso.extraAmount ? formatBRL(avulso.extraAmount) : '');
            setSelectedProducts(avulso.products || []);
        } else if (visible && !avulso) {
            setDescription('');
            setTotalValue('');
            setExtraAmount('');
            setSelectedProducts([]);
        }
    }, [visible, avulso]);

    const updateAvulso = useMutation(api.avulsos.updateAvulso); // Assume this exists or will be added

    // Make description optional in submit
    const handleSubmit = async () => {
        const finalTotal = calculateFinalTotal();
        if (finalTotal <= 0) {
            alert('Por favor, insira um valor total válido');
            return;
        }
        setIsSubmitting(true);
        try {
            if (avulso && avulso._id) {
                await updateAvulso({
                    _id: avulso._id,
                    description: description.trim() || undefined,
                    total: finalTotal,
                    products: selectedProducts.length > 0 ? selectedProducts : undefined,
                    extraAmount: extraAmount ? parseBRL(extraAmount) : undefined,
                });
            } else {
                await createAvulso({
                    description: description.trim() || undefined,
                    total: finalTotal,
                    products: selectedProducts.length > 0 ? selectedProducts : undefined,
                    extraAmount: extraAmount ? parseBRL(extraAmount) : undefined,
                });
            }
            setDescription('');
            setTotalValue('');
            setExtraAmount('');
            setSelectedProducts([]);
            onClose();
        } catch (error) {
            console.error('Error creating/updating avulso:', error);
            alert('Erro ao salvar avulso');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setDescription('');
            setTotalValue('');
            setExtraAmount('');
            setSelectedProducts([]);
            onClose();
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Novo Avulso</Text>
                    <TouchableOpacity onPress={handleClose} disabled={isSubmitting}>
                        <Feather name="x" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>
                <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
                    <View style={styles.section}>
                        <Text style={styles.label}>Descrição (opcional)</Text>
                        <TextInput
                            style={styles.input}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Ex: Água, Café, etc."
                            multiline
                            numberOfLines={3}
                        />
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.label}>Produtos (opcional)</Text>
                        <View style={styles.productSelector}>
                            <View style={styles.productList}>
                                {[...Object.entries(productsByCategory)].reverse().map(([categoryId, { category, products }]) => (
                                    <View key={categoryId} style={styles.categorySection}>
                                        <TouchableOpacity
                                            style={styles.categoryHeader}
                                            onPress={() => toggleCategory(categoryId)}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={styles.categoryTitle}>{category.name}</Text>
                                            <Feather
                                                name={expandedCategories[categoryId] ? 'chevron-up' : 'chevron-down'}
                                                size={20}
                                                color={COLORS.primary}
                                            />
                                        </TouchableOpacity>
                                        {expandedCategories[categoryId] && (
                                            <ScrollView style={styles.innerProductList} nestedScrollEnabled={true}>
                                                {products.map((product) => (
                                                    <TouchableOpacity
                                                        key={product._id}
                                                        style={[
                                                            styles.productOption,
                                                            selectedProduct?._id === product._id && styles.productOptionSelected,
                                                            !product.hasInfiniteStock && product.stock <= 0 && styles.productOptionDisabled,
                                                        ]}
                                                        onPress={() => handleSelectProduct(product)}
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
                                                            <View style={styles.productDetails}>
                                                                {product.notStack && (
                                                                    <Text
                                                                        style={[
                                                                            styles.productTag,
                                                                            selectedProduct?._id === product._id && styles.productTagSelected,
                                                                        ]}
                                                                    >
                                                                        Por Unidade
                                                                    </Text>
                                                                )}
                                                                <Text
                                                                    style={[
                                                                        styles.productPrice,
                                                                        selectedProduct?._id === product._id && styles.productPriceSelected,
                                                                    ]}
                                                                >
                                                                    {formatBRL(product.price)}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                        {!product.hasInfiniteStock && product.stock <= 0 && (
                                                            <Text style={styles.outOfStockText}>Sem estoque</Text>
                                                        )}
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        )}
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                    {selectedProduct && (
                        <>
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
                            <View style={styles.customPriceInput}>
                                <Text style={styles.label}>Preço Personalizado</Text>
                                <TextInput
                                    style={styles.input}
                                    value={customPrice}
                                    onChangeText={setCustomPrice}
                                    placeholder="0,00"
                                    keyboardType="decimal-pad"
                                    editable={!!selectedProduct?.hasCustomPrice}
                                />
                            </View>
                            <TouchableOpacity
                                style={[styles.addButton, (!selectedProduct || !quantity) && styles.addButtonDisabled]}
                                onPress={handleAddItem}
                                disabled={!selectedProduct || !quantity}
                            >
                                <Text style={styles.addButtonText}>Adicionar Item</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    {selectedProducts.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.label}>Itens Adicionados</Text>
                            {selectedProducts.map((item, index) => {
                                const product = products.find(p => p._id === item.productId);
                                const isNotStack = !!product?.notStack;
                                const unitPrice = item.price;
                                const total = item.quantity * unitPrice;
                                return (
                                    <View key={index} style={styles.itemRow}>
                                        <View style={styles.itemInfo}>
                                            <Text style={styles.itemName}>{product?.name}</Text>
                                            {isNotStack ? (
                                                <View style={styles.notStackContainer}>
                                                    <Text style={styles.itemDetails}>
                                                        {item.quantity} x {formatBRL(unitPrice)}
                                                    </Text>
                                                    <Text style={styles.itemTotal}>
                                                        {formatBRL(total)}
                                                    </Text>
                                                </View>
                                            ) : (
                                                <Text style={styles.itemDetails}>
                                                    {formatBRL(unitPrice)}
                                                </Text>
                                            )}
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
                    {/* Move Valor Total and Valor Extra here */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Valor Total (opcional)</Text>
                        <TextInput
                            style={styles.input}
                            value={totalValue}
                            onChangeText={setTotalValue}
                            placeholder="0,00"
                            keyboardType="decimal-pad"
                        />
                        <Text style={styles.helperText}>
                            Deixe em branco para calcular automaticamente
                        </Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.label}>Valor Extra (opcional)</Text>
                        <TextInput
                            style={styles.input}
                            value={extraAmount}
                            onChangeText={setExtraAmount}
                            placeholder="0,00"
                            keyboardType="decimal-pad"
                        />
                    </View>
                    <View style={styles.summarySection}>
                        <Text style={styles.summaryTitle}>Resumo</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Produtos:</Text>
                            <Text style={styles.summaryValue}>{formatBRL(calculateProductsTotal())}</Text>
                        </View>
                        {extraAmount && parseBRL(extraAmount) > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Valor Extra:</Text>
                                <Text style={styles.summaryValue}>{formatBRL(parseBRL(extraAmount))}</Text>
                            </View>
                        )}
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Total:</Text>
                            <Text style={[styles.summaryValue, styles.finalTotal]}>{formatBRL(calculateFinalTotal())}</Text>
                        </View>
                    </View>
                </ScrollView>
                <View style={styles.footer}>
                    <ActionButtons
                        cancelText="Cancelar"
                        confirmText="Criar Avulso"
                        onCancel={handleClose}
                        onConfirm={handleSubmit}
                        confirmDisabled={isSubmitting}
                    />
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
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#333',
    },
    helperText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    productSelector: {
        marginBottom: 20,
    },
    productList: {
        // Remove maxHeight here, handled per category
    },
    innerProductList: {
        maxHeight: 200,
        marginBottom: 8,
    },
    categorySection: {
        marginBottom: 20,
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
        paddingVertical: 8,
        backgroundColor: '#f7f7f7',
        borderRadius: 6,
        marginBottom: 4,
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
    productInfo: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    productDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    productTag: {
        fontSize: 12,
        color: '#666',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    productTagSelected: {
        color: '#fff',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    productPrice: {
        fontSize: 14,
        color: '#666',
    },
    productPriceSelected: {
        color: '#fff',
    },
    outOfStockText: {
        fontSize: 10,
        color: '#F44336',
        fontStyle: 'italic',
    },
    quantityInput: {
        marginBottom: 20,
    },
    customPriceInput: {
        marginBottom: 20,
    },
    addButton: {
        backgroundColor: COLORS.secondary,
        padding: 12,
        borderRadius: 8,
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
    notStackContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    itemTotal: {
        fontWeight: 'bold',
        color: COLORS.primary,
        fontSize: 16,
        marginLeft: 25,
    },
    selectedProduct: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    selectedProductInfo: {
        flex: 1,
    },
    selectedProductName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    selectedProductDetails: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    removeButton: {
        padding: 8,
    },
    summarySection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    finalTotal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
}); 