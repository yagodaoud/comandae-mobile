import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { Doc } from '@/convex/_generated/dataModel';

type Product = Doc<"products">;
type Category = Doc<"product_categories">;

interface SlipItem {
    productId: string;
    quantity: number;
    customPrice?: number;
}

interface ProductsStepProps {
    products: Product[];
    categories: Category[];
    selectedProduct: Product | null;
    setSelectedProduct: (product: Product | null) => void;
    quantity: string;
    setQuantity: (value: string) => void;
    customPrice: string;
    setCustomPrice: (value: string) => void;
    items: SlipItem[];
    onAddItem: () => void;
    onUpdateQuantity: (index: number, delta: number) => void;
    onRemoveItem: (index: number) => void;
    onBack: () => void;
    onNext: () => void;
}

export default function ProductsStep({
    products,
    categories,
    selectedProduct,
    setSelectedProduct,
    quantity,
    setQuantity,
    customPrice,
    setCustomPrice,
    items,
    onAddItem,
    onUpdateQuantity,
    onRemoveItem,
    onBack,
    onNext,
}: ProductsStepProps) {
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
                                                R$ {product.price.toFixed(2)}
                                            </Text>
                                        </View>
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
                onPress={onAddItem}
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
                                        onPress={() => onUpdateQuantity(index, -1)}
                                        style={styles.quantityButton}
                                    >
                                        <Feather name="minus" size={16} color={COLORS.primary} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => onUpdateQuantity(index, 1)}
                                        style={styles.quantityButton}
                                    >
                                        <Feather name="plus" size={16} color={COLORS.primary} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => onRemoveItem(index)}
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
                    onPress={onBack}
                >
                    <Feather name="arrow-left" size={20} color={COLORS.primary} />
                    <Text style={styles.backButtonText}>Voltar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.nextButton, items.length === 0 && styles.nextButtonDisabled]}
                    onPress={onNext}
                    disabled={items.length === 0}
                >
                    <Text style={styles.nextButtonText}>Próximo</Text>
                    <Feather name="arrow-right" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    step: {
        padding: 20,
    },
    stepTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
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
        marginBottom: 16,
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
    productPrice: {
        fontSize: 14,
        color: '#666',
    },
    productPriceSelected: {
        color: '#fff',
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
}); 