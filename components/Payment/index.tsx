import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, ScrollView, Platform, BackHandler, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id, Doc } from '@/convex/_generated/dataModel';
import { useRouter, useLocalSearchParams } from 'expo-router';
import TransparentHeader from '@/components/TransparentHeader';
import { OrderSummary } from './OrderSummary';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { SlipCard } from './SlipCard';
import { TipSelector } from './TipSelector';
import { ExtraAmountInput } from './ExtraAmountInput';
import { SearchBar } from '@/components/SearchBar';
import { FilterChips } from '@/components/FilterChips';
import { EmptyState } from '@/components/EmptyState';
import { ActionButtons } from '@/components/ActionButtons';
import ViewSlipModal from './ViewSlipModal';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import DateTimePicker from '@react-native-community/datetimepicker';
import { parseBRL, formatBRL } from '@/utils/formatBRL';

const paymentMethods = [
    { id: 'cash', name: 'Dinheiro', icon: 'dollar-sign', iconType: 'feather' },
    { id: 'card', name: 'Cartão', icon: 'credit-card', iconType: 'feather' },
    { id: 'pix', name: 'PIX', icon: 'smartphone', iconType: 'feather' },
    { id: 'bitcoin', name: 'Bitcoin', icon: 'bitcoin', iconType: 'material' },
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
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('credit');
    const [tipPercentage, setTipPercentage] = useState(0);
    const [extraAmount, setExtraAmount] = useState('');
    const [cashAmount, setCashAmount] = useState('');
    const [selectedSlip, setSelectedSlip] = useState<{ id: Id<"slips">; table: string; total: number; items: any[] } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<FilterOption>('open');
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [viewingSlip, setViewingSlip] = useState<Slip | null>(null);

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Add ref to track if we've already processed the slipId parameter
    const hasProcessedSlipId = useRef(false);

    const slips = useQuery(api.slips.getSlipsForPayment, {
        isOpen: activeFilter === 'all' ? undefined : activeFilter === 'open',
        searchQuery: searchQuery || undefined,
        date: activeFilter === 'all' ? selectedDate.toISOString().slice(0, 10) : undefined, // Pass date as YYYY-MM-DD
    });

    const products = useQuery(api.products.getProducts) ?? [];

    const updatePayment = useMutation(api.slips.updateSlipPayment);

    const extraAmountNum = extraAmount ? parseBRL(extraAmount) : 0;
    const grandTotal = selectedSlip ? (selectedSlip.total + extraAmountNum) : 0;

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
                price: formatBRL(price),
                total: formatBRL(total),
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

    // Auto-select slip if slipId is provided in params - FIXED VERSION
    useEffect(() => {
        if (params.slipId && !selectedSlip && !hasProcessedSlipId.current) {
            setActiveFilter('open');
            const slip = slips?.find(s => s._id === params.slipId);
            if (slip) {
                setSelectedSlip({
                    id: slip._id,
                    table: slip.table,
                    total: slip.total,
                    items: slip.items
                });
                hasProcessedSlipId.current = true; // Mark as processed
            }
        }
    }, [params.slipId, slips, selectedSlip]);

    // Add effect to handle loading state
    useEffect(() => {
        if (isInitialLoad) {
            setIsLoading(true);
            const timer = setTimeout(() => {
                setIsLoading(false);
                setIsInitialLoad(false);
            }, 300);
            return () => clearTimeout(timer);
        } else {
            // For filter changes, show loading immediately
            setIsLoading(true);
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [slips, activeFilter, searchQuery, isInitialLoad]);

    // Reset hasProcessedSlipId when modal is closed
    useEffect(() => {
        if (!selectedSlip) {
            hasProcessedSlipId.current = false;
            // Remove slipId param from the URL after closing the modal
            if (params.slipId) {
                router.replace({ pathname: '/payment' });
            }
            // Reset all selections and inputs
            setSelectedPaymentMethod('credit');
            setTipPercentage(0);
            setCashAmount('');
        }
    }, [selectedSlip]);

    // Close payment modal when screen loses focus
    useFocusEffect(
        useCallback(() => {
            return () => {
                // This runs when the screen loses focus
                if (selectedSlip) {
                    setSelectedSlip(null);
                    setExtraAmount('');
                    setCashAmount('');
                }
                if (viewingSlip) {
                    setViewingSlip(null);
                    setIsViewModalVisible(false);
                }
            };
        }, [selectedSlip, viewingSlip])
    );

    const handleBackPress = () => {
        if (selectedSlip) {
            setSelectedSlip(null);
            setExtraAmount('');
            setCashAmount('');
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
                tipAmount: 0,
                extraAmount: extraAmountNum,
                cashAmount: selectedPaymentMethod === 'cash' ? parseBRL(cashAmount) : undefined,
            });
            setSelectedSlip(null);
            setExtraAmount('');
            setCashAmount('');
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
            <View style={styles.container}>
                <TransparentHeader
                    title={selectedSlip.table}
                    backButton={true}
                    onBackPress={handleBackPress}
                    icon={null}
                />

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[
                        styles.scrollViewContent,
                        { paddingBottom: 80 + 60 + insets.bottom + 32 } // Button height + tab bar + safe area + margin
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
                            extraAmount={extraAmountNum.toFixed(2)}
                            grandTotal={grandTotal.toFixed(2)}
                        />
                    </View>

                    <View style={styles.section}>
                        <ExtraAmountInput
                            extraAmount={extraAmount}
                            setExtraAmount={setExtraAmount}
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

                    {/* Floating Button Bay inside ScrollView */}
                    <View style={styles.buttonBay}>
                        <ActionButtons
                            cancelText="Voltar"
                            confirmText="Finalizar Pagamento"
                            onCancel={() => {
                                setSelectedSlip(null);
                                setExtraAmount('');
                                setCashAmount('');
                            }}
                            onConfirm={handlePayment}
                        />
                    </View>
                </ScrollView>

                {/* Remove the fixed floating bay */}
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom }]}>
            <TransparentHeader
                title="Pagamento"
                icon={null}
            />

            <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                rightIcon={<MaterialCommunityIcons name="chart-bar" size={22} color="#fff" />}
                onRightIconPress={() => router.push('/report')}
            />

            <FilterChips
                activeFilter={activeFilter}
                onFilterChange={(filter) => setActiveFilter(filter as FilterOption)}
                filters={[...FILTER_OPTIONS] as any}
            />
            {/* Show date picker only for 'all' filter */}
            {activeFilter === 'all' && (
                <View style={{ marginVertical: 8, alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ padding: 8, backgroundColor: COLORS.secondary, borderRadius: 8 }}>
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                            {selectedDate.toLocaleDateString()}
                        </Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={selectedDate}
                            mode="date"
                            display="default"
                            onChange={(event, date) => {
                                setShowDatePicker(false);
                                if (date) setSelectedDate(date);
                            }}
                        />
                    )}
                </View>
            )}

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollViewContent,
                    { paddingBottom: 60 + (Platform.OS === 'ios' ? insets.bottom : 0) }
                ]}
            >
                {slips === undefined ? (
                    <View style={styles.loadingContainer}>
                        <LoadingOverlay
                            size="small"
                            backgroundColor="transparent"
                            overlayOpacity={0}
                        />
                    </View>
                ) : (
                    <>
                        {slips.length > 0 ? (
                            slips
                                .slice()
                                .sort((a, b) => {
                                    // Sorting for Closed slips (by paymentTime descending)
                                    if (activeFilter === 'closed') {
                                        const timeA = a.paymentTime ?? a._creationTime; // Use _creationTime as fallback
                                        const timeB = b.paymentTime ?? b._creationTime;
                                        return timeB - timeA; // Sort by time descending
                                    }

                                    // Sorting for Open and All slips (by time descending)
                                    const timeA = a.isOpen ? a.lastUpdateTime : (a.paymentTime ?? a._creationTime);
                                    const timeB = b.isOpen ? b.lastUpdateTime : (b.paymentTime ?? b._creationTime);

                                    // For 'all' filter, prioritize open slips over closed slips first
                                    if (activeFilter === 'all') {
                                        if (a.isOpen && !b.isOpen) return -1; // a (open) comes before b (closed)
                                        if (!a.isOpen && b.isOpen) return 1;  // b (open) comes before a (closed)
                                    }

                                    return timeB - timeA; // Sort by time descending
                                })
                                .map(slip => (
                                    <SlipCard
                                        key={slip._id}
                                        table={slip.table}
                                        items={slip.items.length}
                                        total={slip.isOpen ? slip.total : (slip.finalTotal || slip.total)}
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
                                ))
                        ) : (
                            <EmptyState
                                icon={<Feather name="clipboard" size={48} color="#ccc" />}
                                message="Nenhuma comanda encontrada"
                            />
                        )}
                    </>
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
    buttonBay: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        marginBottom: 8,
    },
    loadingContainer: {
        flex: 1,
        minHeight: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
});