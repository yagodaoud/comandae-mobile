import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id, Doc } from '@/convex/_generated/dataModel';
import { useRouter } from 'expo-router';
import TransparentHeader from '@/components/TransparentHeader';
import { OrderSummary } from './OrderSummary';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { SlipCard } from './SlipCard';
import { TipSelector } from './TipSelector';
import { SearchBar } from '@/components/SearchBar';
import { FilterChips } from '@/components/FilterChips';
import { EmptyState } from '@/components/EmptyState';
import { ActionButtons } from '@/components/ActionButtons';
import ViewSlipModal from './ViewSlipModal';

const paymentMethods = [
    { id: 'cash', name: 'Dinheiro', icon: 'dollar-sign' },
    { id: 'credit', name: 'Cartão de Crédito', icon: 'credit-card' },
    { id: 'debit', name: 'Cartão de Débito', icon: 'credit-card' },
    { id: 'pix', name: 'PIX', icon: 'smartphone' },
];

const FILTER_OPTIONS = [
    { id: 'open', label: 'Em Aberto', icon: 'clock' },
    { id: 'closed', label: 'Fechadas', icon: 'check-circle' },
    { id: 'all', label: 'Todos', icon: 'list' }
] as const;

type FilterOption = typeof FILTER_OPTIONS[number]['id'];

interface SlipItem {
    productId: Id<"products">;
    quantity: number;
    customPrice?: number;
}

interface FormattedOrderItem {
    id: string;
    name: string;
    quantity: number;
    price: string;
    total: string;
}

type Slip = Doc<"slips">;

export default function Payment() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('credit');
    const [tipPercentage, setTipPercentage] = useState(10);
    const [cashAmount, setCashAmount] = useState('');
    const [selectedSlip, setSelectedSlip] = useState<{ id: Id<"slips">; table: string; total: number; items: any[] } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<FilterOption>('open');

    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [viewingSlip, setViewingSlip] = useState<Slip | null>(null);

    const slips = useQuery(api.slips.getSlipsForPayment, {
        isOpen: activeFilter === 'all' ? undefined : activeFilter === 'open',
        searchQuery: searchQuery || undefined,
    }) ?? [];

    const products = useQuery(api.products.getProducts) ?? [];

    const updatePayment = useMutation(api.slips.updateSlipPayment);

    const tipAmount = selectedSlip ? (selectedSlip.total * (tipPercentage / 100)) : 0;
    const grandTotal = selectedSlip ? (selectedSlip.total + tipAmount) : 0;

    const formatOrderItems = (items: SlipItem[], products: any[]): FormattedOrderItem[] => {
        return items.map(item => {
            const product = products.find(p => p._id === item.productId);
            if (!product) return null;

            const price = item.customPrice ?? product.price;
            const total = price * item.quantity;

            return {
                id: item.productId,
                name: product.name,
                quantity: item.quantity,
                price: price.toFixed(2),
                total: total.toFixed(2),
            };
        }).filter(Boolean) as FormattedOrderItem[];
    };

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (selectedSlip) {
                setSelectedSlip(null);
                return true;
            } else if (viewingSlip) {
                setViewingSlip(null);
                setIsViewModalVisible(false);
                return true;
            }
            return false;
        });

        return () => backHandler.remove();
    }, [selectedSlip, viewingSlip]);

    const handleBackPress = () => {
        if (selectedSlip) {
            setSelectedSlip(null);
        } else if (viewingSlip) {
            setViewingSlip(null);
            setIsViewModalVisible(false);
        } else {
            router.back();
        }
    };

    const handlePayment = async () => {
        if (!selectedSlip) return;

        try {
            await updatePayment({
                id: selectedSlip.id,
                paymentMethod: selectedPaymentMethod,
                tipAmount,
                cashAmount: selectedPaymentMethod === 'cash' ? parseFloat(cashAmount.replace(',', '.')) : undefined,
            });
            setSelectedSlip(null);
        } catch (error) {
            console.error('Error processing payment:', error);
            // TODO: Show error message to user
        }
    };

    const handleViewModalClose = () => {
        setIsViewModalVisible(false);
        setViewingSlip(null);
    };

    if (selectedSlip) {
        const formattedItems = formatOrderItems(selectedSlip.items, products);

        return (
            <View style={[styles.container, { paddingBottom: insets.bottom }]}>
                <TransparentHeader
                    title={selectedSlip.table}
                    backButton={true}
                    onBackPress={handleBackPress}
                />

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[
                        styles.scrollViewContent,
                        { paddingBottom: 300 }
                    ]}
                >
                    <View style={styles.section}>
                        <OrderSummary
                            orderData={{
                                id: selectedSlip.id,
                                table: selectedSlip.table,
                                items: formattedItems,
                                subtotal: selectedSlip.total.toFixed(2),
                                tax: '0.00',
                                total: selectedSlip.total.toFixed(2),
                            }}
                            tipPercentage={tipPercentage}
                            tipAmount={tipAmount.toFixed(2)}
                            grandTotal={grandTotal.toFixed(2)}
                        />
                    </View>

                    <View style={styles.section}>
                        <TipSelector
                            tipPercentage={tipPercentage}
                            setTipPercentage={setTipPercentage}
                        />
                    </View>

                    <View style={styles.section}>
                        <PaymentMethodSelector
                            paymentMethods={paymentMethods}
                            selectedPaymentMethod={selectedPaymentMethod}
                            onSelectPaymentMethod={setSelectedPaymentMethod}
                            cashAmount={cashAmount}
                            onCashAmountChange={setCashAmount}
                            grandTotal={grandTotal.toFixed(2)}
                        />
                    </View>

                    <View style={styles.actionButtonsContainer}>
                        <ActionButtons
                            cancelText="Voltar"
                            confirmText="Finalizar Pagamento"
                            onCancel={() => setSelectedSlip(null)}
                            onConfirm={handlePayment}
                            insets={insets}
                        />
                    </View>
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom }]}>
            <TransparentHeader title="Pagamento" />

            <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddPress={() => console.log('Add new comanda')}
            />

            <FilterChips
                activeFilter={activeFilter}
                onFilterChange={(filter) => setActiveFilter(filter as FilterOption)}
                filters={[...FILTER_OPTIONS] as any}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollViewContent,
                    { paddingBottom: 60 + (Platform.OS === 'ios' ? insets.bottom : 0) }
                ]}
            >
                {slips.map(slip => (
                    <SlipCard
                        key={slip._id}
                        table={slip.table}
                        items={slip.items.length}
                        total={slip.total.toFixed(2)}
                        time={slip.time}
                        status={slip.isOpen ? 'open' : 'closed'}
                        onPress={() => {
                            if (slip.isOpen) {
                                setSelectedSlip({
                                    id: slip._id,
                                    table: slip.table,
                                    total: slip.total,
                                    items: slip.items,
                                });
                            } else {
                                setViewingSlip(slip);
                                setIsViewModalVisible(true);
                            }
                        }}
                    />
                ))}

                {slips.length === 0 && (
                    <EmptyState
                        icon={<Feather name="clipboard" size={48} color="#ccc" />}
                        message="Nenhuma comanda encontrada"
                    />
                )}
            </ScrollView>

            <ViewSlipModal
                visible={isViewModalVisible}
                onClose={handleViewModalClose}
                slip={viewingSlip}
                products={products}
            />
        </View>
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
    scrollViewContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    section: {
        marginBottom: 24,
    },
    actionButtonsContainer: {
        marginTop: 24,
        marginBottom: 16,
        backgroundColor: COLORS.background,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 16,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
    },
});