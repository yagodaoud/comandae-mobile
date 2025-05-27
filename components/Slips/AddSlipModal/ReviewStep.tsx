import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { Doc } from '@/convex/_generated/dataModel';

type Product = Doc<"products">;

interface SlipItem {
    productId: string;
    quantity: number;
    customPrice?: number;
}

interface ReviewStepProps {
    table: string;
    items: SlipItem[];
    products: Product[];
    isSubmitting: boolean;
    onBack: () => void;
    onSubmit: () => void;
}

export default function ReviewStep({
    table,
    items,
    products,
    isSubmitting,
    onBack,
    onSubmit,
}: ReviewStepProps) {
    const total = items.reduce((sum, item) => {
        const product = products.find(p => p._id === item.productId);
        const price = item.customPrice ?? product?.price ?? 0;
        return sum + (price * item.quantity);
    }, 0);

    return (
        <View style={styles.step}>
            <Text style={styles.stepTitle}>Revisar Comanda</Text>

            <View style={styles.reviewSection}>
                <Text style={styles.reviewLabel}>Comanda</Text>
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
                    onPress={onBack}
                >
                    <Feather name="arrow-left" size={20} color={COLORS.primary} />
                    <Text style={styles.backButtonText}>Voltar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                    onPress={onSubmit}
                    disabled={isSubmitting}
                >
                    <Text style={styles.submitButtonText}>
                        {isSubmitting ? 'Salvando...' : 'Salvar Comanda'}
                    </Text>
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
}); 