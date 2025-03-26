import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import TransparentHeader from '@/components/TransparentHeader';
import { OrderSummary } from './OrderSummary';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { SlipCard } from './SlipCard';
import { TipSelector } from './TipSelector';
import { SearchBar } from '@/components/SearchBar';
import { FilterChips } from '@/components/FilterChips';
import { EmptyState } from '@/components/EmptyState';
import { ActionButtons } from '@/components/ActionButtons';

type Comanda = {
    id: string;
    table: string;
    items: number;
    total: string;
    time: string;
    status: 'open' | 'closed';
};

type OrderData = {
    id: string;
    table: string;
    items: {
        id: string;
        name: string;
        quantity: number;
        price: string;
        total: string;
    }[];
    subtotal: string;
    tax: string;
    total: string;
};

const initialComandas: Comanda[] = [
    { id: '1', table: 'Mesa 1', items: 4, total: '124,90', time: '15min', status: 'open' },
    { id: '2', table: 'Mesa 3', items: 6, total: '198,50', time: '42min', status: 'closed' },
    { id: '3', table: 'Mesa 7', items: 8, total: '345,20', time: '1h 12min', status: 'closed' },
    { id: '4', table: 'Mesa 9', items: 2, total: '64,80', time: '7min', status: 'open' },
];

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
];

const generateOrderData = (comanda: Comanda): OrderData => ({
    id: comanda.id,
    table: comanda.table,
    items: [
        { id: '1', name: 'Item 1', quantity: 1, price: '50,00', total: '50,00' },
        { id: '2', name: 'Item 2', quantity: 2, price: '25,00', total: '50,00' },
    ],
    subtotal: '100,00',
    tax: '10,00',
    total: comanda.total,
});

const calculateTipAmount = (total: string, percentage: number): string => {
    const amount = parseFloat(total.replace(',', '.')) * (percentage / 100);
    return amount.toFixed(2).replace('.', ',');
};

const calculateGrandTotal = (total: string, tipAmount: string): string => {
    const result = parseFloat(total.replace(',', '.')) + parseFloat(tipAmount.replace(',', '.'));
    return result.toFixed(2).replace('.', ',');
};

const calculateChange = (cashAmount: string, grandTotal: string): string => {
    if (!cashAmount) return '0,00';
    const change = parseFloat(cashAmount.replace(',', '.')) - parseFloat(grandTotal.replace(',', '.'));
    return change > 0 ? change.toFixed(2).replace('.', ',') : '0,00';
};

export default function Payment({ navigation }) {
    const insets = useSafeAreaInsets();
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('credit');
    const [tipPercentage, setTipPercentage] = useState(10);
    const [cashAmount, setCashAmount] = useState('');
    const [selectedSlip, setSelectedSlip] = useState<Comanda | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('open');

    const filteredComandas = initialComandas.filter(comanda => {
        const matchesSearch = comanda.table.toLowerCase().includes(searchQuery.toLowerCase());
        if (activeFilter === 'all') return matchesSearch;
        return matchesSearch && comanda.status === activeFilter;
    });

    const tipAmount = selectedSlip ? calculateTipAmount(selectedSlip.total, tipPercentage) : '0,00';
    const grandTotal = selectedSlip ? calculateGrandTotal(selectedSlip.total, tipAmount) : '0,00';

    const handleBackPress = () => {
        selectedSlip ? setSelectedSlip(null) : navigation.goBack();
    };

    if (selectedSlip) {
        const orderData = generateOrderData(selectedSlip);

        return (
            <View style={styles.container}>
                <TransparentHeader
                    title={selectedSlip.table}
                    backButton={true}
                    onBackPress={handleBackPress}
                />

                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
                    <View style={styles.section}>
                        <OrderSummary
                            orderData={orderData}
                            tipPercentage={tipPercentage}
                            tipAmount={tipAmount}
                            grandTotal={grandTotal}
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
                            grandTotal={grandTotal}
                        />
                    </View>
                </ScrollView>

                <ActionButtons
                    cancelText="Voltar"
                    confirmText="Finalizar Pagamento"
                    onCancel={() => setSelectedSlip(null)}
                    onConfirm={() => {
                        console.log('Payment confirmed');
                        setSelectedSlip(null);
                    }}
                    insets={insets}
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <TransparentHeader title="Pagamento" />

            <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddPress={() => console.log('Add new comanda')}
            />

            <FilterChips
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                filters={FILTER_OPTIONS}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollViewContent,
                    { paddingBottom: 60 + (Platform.OS === 'ios' ? insets.bottom : 0) }
                ]}
            >
                {filteredComandas.map(comanda => (
                    <SlipCard
                        key={comanda.id}
                        table={comanda.table}
                        items={comanda.items}
                        total={comanda.total}
                        time={comanda.time}
                        status={comanda.status}
                        onPress={() => setSelectedSlip(comanda)}
                    />
                ))}

                {filteredComandas.length === 0 && (
                    <EmptyState
                        icon={<Feather name="clipboard" size={48} color="#ccc" />}
                        message="Nenhuma comanda encontrada"
                    />
                )}
            </ScrollView>
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
});