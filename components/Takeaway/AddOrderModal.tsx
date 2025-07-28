import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { COLORS } from '@/constants/theme';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { format } from 'date-fns';
import { parseBRL } from '@/utils/formatBRL';
import { useMutation } from 'convex/react';
import { Id } from '@/convex/_generated/dataModel';
import { Animated, Easing } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Move the styles definition to the top of the file, before the component definition, to ensure all usages of 'styles' are valid.
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 0,
        marginTop: 0,
        marginLeft: 0,
    },
    stepLabel: {
        fontSize: 16,
        color: COLORS.secondary,
        marginBottom: 16,
        fontWeight: '600',
    },
    formGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 15,
        color: '#555',
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 8,
    },
    marmitexCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    marmitexTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    marmitexObs: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
    },
    removeButton: {
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    addMarmitexForm: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 12,
        marginTop: 12,
        marginBottom: 12,
    },
    sizeButton: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: COLORS.secondary,
    },
    sizeButtonSelected: {
        backgroundColor: COLORS.secondary,
    },
    categorySection: {
        marginBottom: 12,
    },
    dishList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 6,
    },
    dishButton: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 8,
        borderWidth: 1,
        borderColor: COLORS.secondary,
        marginRight: 8,
        marginBottom: 8,
    },
    dishButtonSelected: {
        backgroundColor: COLORS.secondary,
    },
    addButton: {
        backgroundColor: COLORS.secondary,
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    cancelButton: {
        backgroundColor: '#eee',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    stepButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 24,
        gap: 12,
    },
    backButton: {
        backgroundColor: '#eee',
        borderRadius: 8,
        padding: 12,
        marginRight: 8,
    },
    nextButton: {
        backgroundColor: COLORS.secondary,
        borderRadius: 8,
        padding: 12,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    stepIndicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    stepDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#eee',
    },
    stepDotActive: {
        backgroundColor: COLORS.secondary,
    },
    stepperContainer: {
        marginBottom: 12,
        paddingHorizontal: 18,
        paddingTop: 12,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: '#eee',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBar: {
        height: 6,
        backgroundColor: COLORS.secondary,
        borderRadius: 3,
    },
    stepLabelsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    stepLabelContainer: {
        alignItems: 'center',
        flex: 1,
    },
    stepCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#eee',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
    },
    stepCircleActive: {
        backgroundColor: COLORS.secondary,
    },
    stepCircleText: {
        color: '#888',
        fontWeight: 'bold',
        fontSize: 15,
    },
    stepCircleTextActive: {
        color: '#fff',
    },
    stepLabelText: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
        textAlign: 'center',
    },
    stepLabelTextActive: {
        color: COLORS.secondary,
        fontWeight: 'bold',
    },
    stepDesc: {
        fontSize: 14,
        color: '#555',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.18)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCard: {
        width: '96%',
        maxWidth: 420,
        height: '90%', // fill most of the screen vertically
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        overflow: 'hidden',
        elevation: 12,
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 24,
        alignItems: 'stretch',
        justifyContent: 'flex-start',
    },
    modalContent: {
        flex: 1,
        minHeight: 320,
        marginTop: 8,
        marginBottom: 8,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    closeButton: {
        padding: 6,
        borderRadius: 16,
        backgroundColor: '#f5f5f5',
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 8,
    },
    chip: {
        backgroundColor: '#f5f5f5',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 6,
        marginBottom: 6,
        borderWidth: 1,
        borderColor: '#eee',
    },
    chipActive: {
        backgroundColor: COLORS.secondary,
        borderColor: COLORS.secondary,
    },
    chipText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 15,
    },
    chipTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    emptyText: {
        color: '#888',
        fontSize: 15,
        marginBottom: 8,
        textAlign: 'center',
    },
    summaryCard: {
        backgroundColor: '#f8f8f8',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    marmitexTypeCard: {
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        padding: 15,
        margin: 5,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    marmitexTypeCardActive: {
        backgroundColor: COLORS.secondary,
        borderColor: COLORS.secondary,
    },
    marmitexTypeName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.primary,
        textAlign: 'center',
    },
    marmitexExpandedCard: {
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 15,
        marginTop: 10,
        marginBottom: 10,
    },
    dishQtyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    qtyButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: COLORS.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5,
    },
    qtyButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    dishQtyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginHorizontal: 10,
    },
    dishName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
        flex: 1,
    },
    confirmMarmitexButton: {
        backgroundColor: COLORS.secondary,
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    marmitexSummaryCard: {
        backgroundColor: '#f8f8f8',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    dishSummary: {
        fontSize: 14,
        color: '#555',
        marginTop: 4,
    },
});

interface AddOrderModalProps {
    visible: boolean;
    onClose: () => void;
}

interface MarmitexDraft {
    sizeProductId: string;
    dishSelections: Record<string, string[]>; // categoryId -> dishIds[]
    semCategories: Record<string, boolean>; // categoryId -> true if 'Sem {category}'
    observation: string;
    extraPrice: string;
}

export default function AddOrderModal({ visible, onClose }: AddOrderModalProps) {
    const [step, setStep] = useState(0);
    const [customerName, setCustomerName] = useState('');
    const [marmitexList, setMarmitexList] = useState<MarmitexDraft[]>([]);
    const [currentMarmitex, setCurrentMarmitex] = useState<MarmitexDraft | null>(null);

    // Fetch categories and products
    const categories = useQuery(api.products.getProductCategories) ?? [];
    const products = useQuery(api.products.getProducts) ?? [];
    // After fetching categories and products, add logging
    console.log('Fetched categories:', categories);
    console.log('Fetched products:', products);

    // Update category selection to use 'Marmitas' as the main match
    let marmitexCategory = categories.find(c => c.name.trim().toLowerCase() === 'marmitas');
    if (!marmitexCategory) {
        console.log('No exact match for "Marmitas". Trying partial match...');
        marmitexCategory = categories.find(c => c.name.toLowerCase().includes('marmit'));
    }
    if (!marmitexCategory && categories.length === 1) {
        console.log('No match for "Marmitas". Only one category, using it as fallback.');
        marmitexCategory = categories[0];
    }
    if (!marmitexCategory) {
        console.warn('Marmitas category not found. Check your categories.');
    } else {
        console.log('Selected marmitexCategory:', marmitexCategory);
    }
    // Comment out real fetching and use mock for marmitexSizes
    // let marmitexCategory = categories.find(c => c.name.trim().toLowerCase() === 'marmitas');
    // if (!marmitexCategory) {
    //     console.log('No exact match for "Marmitas". Trying partial match...');
    //     marmitexCategory = categories.find(c => c.name.toLowerCase().includes('marmit'));
    // }
    // if (!marmitexCategory && categories.length === 1) {
    //     console.log('No match for "Marmitas". Only one category, using it as fallback.');
    //     marmitexCategory = categories[0];
    // }
    // if (!marmitexCategory) {
    //     console.warn('Marmitas category not found. Check your categories.');
    // } else {
    //     console.log('Selected marmitexCategory:', marmitexCategory);
    // }
    const marmitexSizes = [
        { _id: 'mock1', name: 'Marmitex Pequena' },
        { _id: 'mock2', name: 'Marmitex Média' },
        { _id: 'mock3', name: 'Marmitex Grande' },
    ];
    console.log('marmitexSizes:', marmitexSizes);

    // Fetch today's menu dishes
    const today = format(new Date(), 'yyyy-MM-dd');
    const dailyMenuDishes = useQuery(api.menu.getDailyMenuDishes, { date: today }) ?? [];
    const allDishes = useQuery(api.menu.getDishes) ?? [];
    const dishMap = Object.fromEntries(allDishes.map(d => [d._id, d]));
    // Group daily menu dishes by category
    const menuDishIds = dailyMenuDishes.map(d => d.dishId);
    const menuDishes = menuDishIds.map(id => dishMap[id]).filter(Boolean);
    const dishCategories = Array.from(new Set(menuDishes.map(d => d.categoryId)));
    const categoryMap = Object.fromEntries(categories.map(c => [c._id, c]));

    const steps = [
        'Marmitex',
        'Extras',
        'Pagamento',
        'Resumo',
    ];

    const STEP_LABELS = [
        { label: 'Marmitex', desc: 'Adicione as marmitex do pedido.' },
        { label: 'Extras', desc: 'Inclua produtos extras, se necessário.' },
        { label: 'Pagamento', desc: 'Selecione o método e valor do pagamento.' },
        { label: 'Resumo', desc: 'Confira e confirme o pedido.' },
    ];

    const [stepAnim] = useState(new Animated.Value(0));

    const animateStep = (to: number) => {
        Animated.timing(stepAnim, {
            toValue: to,
            duration: 350,
            easing: Easing.out(Easing.exp),
            useNativeDriver: false,
        }).start();
    };

    const handleNext = () => {
        animateStep(Math.min(step + 1, steps.length - 1));
        setStep((s) => Math.min(s + 1, steps.length - 1));
    };
    const handleBack = () => {
        animateStep(Math.max(step - 1, 0));
        setStep((s) => Math.max(s - 1, 0));
    };

    // Marmitex step logic
    const [showAddMarmitex, setShowAddMarmitex] = useState(false);
    const [sizeProductId, setSizeProductId] = useState('');
    const [dishSelections, setDishSelections] = useState<Record<string, string[]>>({});
    const [semCategories, setSemCategories] = useState<Record<string, boolean>>({});
    const [observation, setObservation] = useState('');
    const [extraPrice, setExtraPrice] = useState('');

    const resetMarmitexForm = () => {
        setSizeProductId('');
        setDishSelections({});
        setSemCategories({});
        setObservation('');
        setExtraPrice('');
    };

    const handleAddMarmitex = () => {
        if (!sizeProductId) {
            Alert.alert('Selecione o tamanho da Marmitex');
            return;
        }
        setMarmitexList(list => [
            ...list,
            {
                sizeProductId,
                dishSelections: { ...dishSelections },
                semCategories: { ...semCategories },
                observation,
                extraPrice,
            },
        ]);
        resetMarmitexForm();
        setShowAddMarmitex(false);
    };

    const handleRemoveMarmitex = (idx: number) => {
        setMarmitexList(list => list.filter((_, i) => i !== idx));
    };

    const [extras, setExtras] = useState<{ productId: string; quantity: string }[]>([]);
    const [selectedExtraProduct, setSelectedExtraProduct] = useState('');
    const [extraQuantity, setExtraQuantity] = useState('1');

    const handleAddExtra = () => {
        if (!selectedExtraProduct || !extraQuantity || isNaN(Number(extraQuantity)) || Number(extraQuantity) <= 0) {
            Alert.alert('Selecione um produto e quantidade válida');
            return;
        }
        setExtras(list => [
            ...list,
            { productId: selectedExtraProduct, quantity: extraQuantity },
        ]);
        setSelectedExtraProduct('');
        setExtraQuantity('1');
    };

    const handleRemoveExtra = (idx: number) => {
        setExtras(list => list.filter((_, i) => i !== idx));
    };

    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paymentAmount, setPaymentAmount] = useState('');

    const paymentMethods = [
        { id: 'cash', label: 'Dinheiro' },
        { id: 'card', label: 'Cartão' },
        { id: 'pix', label: 'PIX' },
        { id: 'bitcoin', label: 'Bitcoin' },
    ];

    const createTakeawayOrder = useMutation(api.menu.createTakeawayOrder);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirm = async () => {
        if (!customerName || marmitexList.length === 0 || !paymentAmount || isNaN(Number(paymentAmount)) || Number(paymentAmount) <= 0) {
            Alert.alert('Preencha todos os campos obrigatórios');
            return;
        }
        setIsSubmitting(true);
        try {
            await createTakeawayOrder({
                customerName,
                marmitexList: marmitexList.map(m => ({
                    sizeProductId: m.sizeProductId as Id<'products'>,
                    dishSelections: Object.entries(m.dishSelections).map(([categoryId, dishIds]) => ({
                        categoryId: categoryId as Id<'dish_categories'>,
                        dishIds: dishIds as Id<'dishes'>[],
                    })),
                    observation: m.observation,
                    extraPrice: m.extraPrice ? parseBRL(m.extraPrice) : undefined,
                })),
                otherProducts: extras.map(e => ({ productId: e.productId as Id<'products'>, quantity: Number(e.quantity) })),
                paymentInfo: {
                    method: paymentMethod,
                    amount: parseBRL(paymentAmount),
                },
            });
            Alert.alert('Pedido criado', 'O pedido foi adicionado à fila!');
            onClose();
        } catch (err) {
            Alert.alert('Erro', 'Não foi possível criar o pedido.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const StepIndicator = () => (
        <View style={styles.stepperContainer}>
            <View style={styles.progressBarBg}>
                <Animated.View style={[styles.progressBar, {
                    width: stepAnim.interpolate({
                        inputRange: [0, steps.length - 1],
                        outputRange: ['0%', '100%'],
                    })
                }]} />
            </View>
            <View style={styles.stepLabelsRow}>
                {STEP_LABELS.map((s, idx) => (
                    <View key={s.label} style={styles.stepLabelContainer}>
                        <View style={[styles.stepCircle, step === idx && styles.stepCircleActive]}>
                            <Text style={[styles.stepCircleText, step === idx && styles.stepCircleTextActive]}>{idx + 1}</Text>
                        </View>
                        <Text style={[styles.stepLabelText, step === idx && styles.stepLabelTextActive]}>{s.label}</Text>
                    </View>
                ))}
            </View>
            <Text style={styles.stepDesc}>{STEP_LABELS[step].desc}</Text>
        </View>
    );

    // --- Marmitex Step Refactor ---
    // Mock marmitex types
    const marmitexTypes = [
        { _id: 'mock1', name: 'Marmitex Pequena' },
        { _id: 'mock2', name: 'Marmitex Média' },
        { _id: 'mock3', name: 'Marmitex Grande' },
    ];
    // Mock grouped daily menu items
    const groupedMenu = [
        { group: 'Arroz', dishes: [{ _id: 'arroz1', name: 'Arroz Branco' }] },
        { group: 'Feijão', dishes: [{ _id: 'feijao1', name: 'Feijão Carioca' }] },
        { group: 'Carnes', dishes: [{ _id: 'carne1', name: 'Bife Acebolado' }, { _id: 'carne2', name: 'Frango Grelhado' }] },
        { group: 'Guarnições', dishes: [{ _id: 'guar1', name: 'Batata Frita' }] },
        { group: 'Saladas', dishes: [{ _id: 'salada1', name: 'Alface' }, { _id: 'salada2', name: 'Tomate' }] },
    ];
    const [expandedMarmitex, setExpandedMarmitex] = useState<string | null>(null);
    const [marmitexQuantity, setMarmitexQuantity] = useState<Record<string, string>>({});
    const [dishQuantities, setDishQuantities] = useState<Record<string, Record<string, number>>>({}); // {marmitexId: {dishId: qty}}
    const [confirmedMarmitex, setConfirmedMarmitex] = useState<any[]>([]);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                    <View style={styles.titleRow}>
                        <Text style={styles.title}>Novo Pedido</Text>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <MaterialIcons name="close" size={22} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>
                    <StepIndicator />
                    <View style={styles.modalContent}>
                        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 12 }}>
                            {/* Step 0: Marmitex */}
                            {step === 0 && (
                                <>
                                    <Text style={styles.sectionTitle}>Escolha o tipo de Marmitex</Text>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                                        {marmitexTypes.map((type) => (
                                            <TouchableOpacity
                                                key={type._id}
                                                style={[styles.marmitexTypeCard, expandedMarmitex === type._id && styles.marmitexTypeCardActive]}
                                                onPress={() => setExpandedMarmitex(expandedMarmitex === type._id ? null : type._id)}
                                            >
                                                <Text style={styles.marmitexTypeName}>{type.name}</Text>
                                                {confirmedMarmitex.find(m => m._id === type._id) && (
                                                    <MaterialIcons name="check-circle" size={20} color={COLORS.secondary} style={{ marginTop: 4 }} />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                    {expandedMarmitex && (
                                        <View style={styles.marmitexExpandedCard}>
                                            <Text style={styles.label}>Quantidade</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={marmitexQuantity[expandedMarmitex] || ''}
                                                onChangeText={val => setMarmitexQuantity(q => ({ ...q, [expandedMarmitex]: val }))}
                                                placeholder="1"
                                                keyboardType="numeric"
                                            />
                                            {marmitexQuantity[expandedMarmitex] && (
                                                <>
                                                    <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Monte seu prato</Text>
                                                    {groupedMenu.map(group => (
                                                        <View key={group.group} style={{ marginBottom: 8 }}>
                                                            <Text style={styles.label}>{group.group}</Text>
                                                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                                                {group.dishes.map(dish => (
                                                                    <View key={dish._id} style={styles.dishQtyRow}>
                                                                        <TouchableOpacity
                                                                            style={styles.qtyButton}
                                                                            onPress={() => setDishQuantities(dq => ({
                                                                                ...dq,
                                                                                [expandedMarmitex]: {
                                                                                    ...((dq[expandedMarmitex] || {})),
                                                                                    [dish._id]: Math.max(0, (dq[expandedMarmitex]?.[dish._id] || 0) - 1)
                                                                                }
                                                                            }))}
                                                                        >
                                                                            <Text style={styles.qtyButtonText}>-</Text>
                                                                        </TouchableOpacity>
                                                                        <Text style={styles.dishQtyText}>{dishQuantities[expandedMarmitex]?.[dish._id] || 0}</Text>
                                                                        <TouchableOpacity
                                                                            style={styles.qtyButton}
                                                                            onPress={() => setDishQuantities(dq => ({
                                                                                ...dq,
                                                                                [expandedMarmitex]: {
                                                                                    ...((dq[expandedMarmitex] || {})),
                                                                                    [dish._id]: (dq[expandedMarmitex]?.[dish._id] || 0) + 1
                                                                                }
                                                                            }))}
                                                                        >
                                                                            <Text style={styles.qtyButtonText}>+</Text>
                                                                        </TouchableOpacity>
                                                                        <Text style={styles.dishName}>{dish.name}</Text>
                                                                    </View>
                                                                ))}
                                                            </View>
                                                        </View>
                                                    ))}
                                                    <TouchableOpacity
                                                        style={styles.confirmMarmitexButton}
                                                        onPress={() => {
                                                            setConfirmedMarmitex(list => [...list.filter(m => m._id !== expandedMarmitex), {
                                                                _id: expandedMarmitex,
                                                                name: marmitexTypes.find(t => t._id === expandedMarmitex)?.name,
                                                                quantity: marmitexQuantity[expandedMarmitex],
                                                                dishes: dishQuantities[expandedMarmitex] || {},
                                                            }]);
                                                            setExpandedMarmitex(null);
                                                        }}
                                                    >
                                                        <Text style={styles.buttonText}>Confirmar</Text>
                                                    </TouchableOpacity>
                                                </>
                                            )}
                                        </View>
                                    )}
                                    {confirmedMarmitex.length > 0 && (
                                        <View style={{ marginTop: 16 }}>
                                            <Text style={styles.sectionTitle}>Marmitex Adicionadas</Text>
                                            {confirmedMarmitex.map(m => (
                                                <View key={m._id} style={styles.marmitexSummaryCard}>
                                                    <Text style={styles.marmitexTypeName}>{m.name} x{m.quantity}</Text>
                                                    <Text style={styles.label}>Prato:</Text>
                                                    {Object.entries(m.dishes).map(([dishId, qty]) => (
                                                        Number(qty) > 0 && <Text key={dishId} style={styles.dishSummary}>{groupedMenu.flatMap(g => g.dishes).find(d => d._id === dishId)?.name}: {String(qty)}</Text>
                                                    ))}
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </>
                            )}
                            {/* Step 1: Extras */}
                            {step === 1 && (
                                <>
                                    <Text style={styles.sectionTitle}>Extras Adicionados</Text>
                                    {extras.length === 0 && <Text style={styles.emptyText}>Nenhum extra adicionado ainda.</Text>}
                                    {extras.map((e, idx) => (
                                        <View key={idx} style={styles.marmitexCard}>
                                            <Text style={styles.marmitexTitle}>{products.find(p => p._id === e.productId)?.name || 'Produto'}</Text>
                                            <Text style={styles.marmitexObs}>Quantidade: {e.quantity}</Text>
                                            <TouchableOpacity onPress={() => handleRemoveExtra(idx)} style={styles.removeButton}>
                                                <MaterialIcons name="delete" size={20} color={COLORS.error} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                    <View style={styles.addMarmitexForm}>
                                        <Text style={styles.label}>Produto</Text>
                                        <View style={styles.chipRow}>
                                            {products.map(prod => (
                                                <TouchableOpacity
                                                    key={prod._id}
                                                    style={[styles.chip, selectedExtraProduct === prod._id && styles.chipActive]}
                                                    onPress={() => setSelectedExtraProduct(prod._id)}
                                                >
                                                    <Text style={[styles.chipText, selectedExtraProduct === prod._id && styles.chipTextActive]}>{prod.name}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                        <Text style={styles.label}>Quantidade</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={extraQuantity}
                                            onChangeText={setExtraQuantity}
                                            placeholder="1"
                                            keyboardType="numeric"
                                        />
                                        <TouchableOpacity style={styles.addButton} onPress={handleAddExtra}>
                                            <MaterialIcons name="add" size={18} color="#fff" />
                                            <Text style={styles.buttonText}>Adicionar Extra</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
                            {/* Step 2: Pagamento */}
                            {step === 2 && (
                                <>
                                    <Text style={styles.sectionTitle}>Pagamento</Text>
                                    <Text style={styles.label}>Forma de Pagamento</Text>
                                    <View style={styles.chipRow}>
                                        {paymentMethods.map(method => (
                                            <TouchableOpacity
                                                key={method.id}
                                                style={[styles.chip, paymentMethod === method.id && styles.chipActive]}
                                                onPress={() => setPaymentMethod(method.id)}
                                            >
                                                <Text style={[styles.chipText, paymentMethod === method.id && styles.chipTextActive]}>{method.label}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                    <Text style={styles.label}>Valor Recebido</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={paymentAmount}
                                        onChangeText={setPaymentAmount}
                                        placeholder="0,00"
                                        keyboardType="decimal-pad"
                                    />
                                </>
                            )}
                            {/* Step 3: Resumo */}
                            {step === 3 && (
                                <>
                                    <Text style={styles.sectionTitle}>Resumo do Pedido</Text>
                                    <View style={styles.summaryCard}>
                                        <Text style={styles.label}>Cliente: <Text style={{ fontWeight: 'bold' }}>{customerName}</Text></Text>
                                        <Text style={styles.sectionTitle}>Marmitex</Text>
                                        {marmitexList.map((m, idx) => (
                                            <View key={idx} style={styles.marmitexCard}>
                                                <Text style={styles.marmitexTitle}>{marmitexSizes.find(s => s._id === m.sizeProductId)?.name || 'Tamanho'}</Text>
                                                {Object.entries(m.dishSelections).map(([catId, dishIds]) => (
                                                    <Text key={catId} style={styles.marmitexObs}>
                                                        {categoryMap[catId]?.name}: {dishIds.map(did => dishMap[did]?.name).join(', ') || (m.semCategories?.[catId] ? 'Sem' : 'Nenhum')}
                                                    </Text>
                                                ))}
                                                {m.observation ? <Text style={styles.marmitexObs}>Obs: {m.observation}</Text> : null}
                                                {m.extraPrice ? <Text style={styles.marmitexObs}>Extra: {m.extraPrice}</Text> : null}
                                            </View>
                                        ))}
                                        <Text style={styles.sectionTitle}>Extras</Text>
                                        {extras.length === 0 && <Text style={styles.emptyText}>Nenhum extra.</Text>}
                                        {extras.map((e, idx) => (
                                            <View key={idx} style={styles.marmitexCard}>
                                                <Text style={styles.marmitexTitle}>{products.find(p => p._id === e.productId)?.name || 'Produto'}</Text>
                                                <Text style={styles.marmitexObs}>Quantidade: {e.quantity}</Text>
                                            </View>
                                        ))}
                                        <Text style={styles.sectionTitle}>Pagamento</Text>
                                        <Text style={styles.label}>Método: {paymentMethods.find(m => m.id === paymentMethod)?.label}</Text>
                                        <Text style={styles.label}>Valor: {paymentAmount}</Text>
                                    </View>
                                </>
                            )}
                        </ScrollView>
                    </View>
                    <View style={styles.stepButtons}>
                        {step > 0 && (
                            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                                <MaterialIcons name="arrow-back" size={20} color={COLORS.secondary} />
                                <Text style={[styles.buttonText, { color: COLORS.secondary }]}>Voltar</Text>
                            </TouchableOpacity>
                        )}
                        {step < steps.length - 1 && (
                            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                                <Text style={styles.buttonText}>Próximo</Text>
                                <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                            </TouchableOpacity>
                        )}
                        {step === steps.length - 1 && (
                            <TouchableOpacity style={styles.nextButton} onPress={handleConfirm} disabled={isSubmitting}>
                                <Text style={styles.buttonText}>{isSubmitting ? 'Salvando...' : 'Finalizar'}</Text>
                                <MaterialIcons name="check" size={20} color="#fff" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
} 