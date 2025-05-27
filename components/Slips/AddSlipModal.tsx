import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id, Doc } from '@/convex/_generated/dataModel';
import StepIndicator from './StepIndicator';
import TableStep from './AddSlipModal/TableStep';
import ProductsStep from './AddSlipModal/ProductsStep';
import ReviewStep from './AddSlipModal/ReviewStep';

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
        }
    }, [visible, editingSlip]);

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
                    {currentStep === 'table' && (
                        <TableStep
                            table={table}
                            setTable={setTable}
                            tableError={tableError}
                            onNext={handleNextStep}
                        />
                    )}
                    {currentStep === 'products' && (
                        <ProductsStep
                            products={products}
                            categories={categories}
                            selectedProduct={selectedProduct}
                            setSelectedProduct={setSelectedProduct}
                            quantity={quantity}
                            setQuantity={setQuantity}
                            customPrice={customPrice}
                            setCustomPrice={setCustomPrice}
                            items={items}
                            onAddItem={handleAddItem}
                            onUpdateQuantity={handleUpdateQuantity}
                            onRemoveItem={handleRemoveItem}
                            onBack={() => setCurrentStep('table')}
                            onNext={() => setCurrentStep('review')}
                        />
                    )}
                    {currentStep === 'review' && (
                        <ReviewStep
                            table={table}
                            items={items}
                            products={products}
                            isSubmitting={isSubmitting}
                            onBack={() => setCurrentStep('products')}
                            onSubmit={handleSubmit}
                        />
                    )}
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
}); 