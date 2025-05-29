import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform, Keyboard, KeyboardAvoidingView, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/theme';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Doc, Id } from '@/convex/_generated/dataModel';
import { Ionicons } from '@expo/vector-icons';
import TransparentHeader from '@/components/TransparentHeader';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';

import ImageUploadSection from './ImageUploadSection';
import ProcessButton from './ProcessButton';
import GeneratedMenuSection from './GeneratedMenuSection';
import TextEditorSection from './TextEditorSection';
import { DishSelectionModal } from './DishSelectionModal';
import { matchDishesWithOCR, processImageWithOCR, generateMenuContent } from '@/utils/ocrUtils';
import { useAllDishes } from '../hooks/useDishes';

interface State {
    imageUri: string | null;
    headerText: string;
    footerText: string;
    isProcessing: boolean;
    generatedMenu: string | null;
    matchedDishes: Doc<'dishes'>[];
    selectedDishIds: Set<string>;
    isSelectionModalVisible: boolean;
}

const ActionCard = ({
    icon,
    title,
    subtitle,
    onPress
}: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle: string;
    onPress: () => void;
}) => (
    <TouchableOpacity
        style={styles.actionCard}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <View style={styles.actionIcon}>
            <Ionicons name={icon} size={24} color={COLORS.secondary} />
        </View>
        <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>{title}</Text>
            <Text style={styles.actionSubtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
    </TouchableOpacity>
);

export default function MenuGenerationScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const scrollViewRef = useRef<ScrollView>(null);

    const [state, setState] = useState<State>({
        imageUri: null,
        headerText: '',
        footerText: '',
        isProcessing: false,
        generatedMenu: null,
        matchedDishes: [],
        selectedDishIds: new Set<string>(),
        isSelectionModalVisible: false
    });

    const dishesOptions = useMemo(() => ({
        activeCategory: null,
        searchQuery: null,
        itemsPerPage: null
    }), []);

    const { dishes, isLoading } = useAllDishes();

    // Get active header and footer from Convex
    const activeHeader = useQuery(api.menu.getActiveHeader);
    const activeFooter = useQuery(api.menu.getActiveFooter);

    // Mutations for updating header and footer
    const upsertHeader = useMutation(api.menu.upsertHeader);
    const upsertFooter = useMutation(api.menu.upsertFooter);

    // Update state when active header/footer changes
    useEffect(() => {
        if (activeHeader) {
            setState(prev => ({ ...prev, headerText: activeHeader.content }));
        }
        if (activeFooter) {
            setState(prev => ({ ...prev, footerText: activeFooter.content }));
        }
    }, [activeHeader, activeFooter]);

    useEffect(() => {
        return () => { };
    }, []);

    const pickImage = async (useCamera = false) => {
        const options: ImagePicker.ImagePickerOptions = {
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 5] as [number, number],
            quality: 0.8,
        };

        try {
            if (useCamera) {
                const { granted } = await ImagePicker.requestCameraPermissionsAsync();
                if (!granted) {
                    Alert.alert("Permissão Necessária", "Acesso à câmera é necessário para tirar foto.");
                    return;
                }
                const result = await ImagePicker.launchCameraAsync(options);
                handleImageResult(result);
            } else {
                const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (!granted) {
                    Alert.alert("Permissão Necessária", "Acesso à galeria é necessário para escolher uma imagem.");
                    return;
                }
                const result = await ImagePicker.launchImageLibraryAsync(options);
                handleImageResult(result);
            }
        } catch (error) {
            console.error("ImagePicker Error: ", error);
            Alert.alert("Erro", "Não foi possível carregar a imagem.");
        }
    };

    const handleImageResult = (result: ImagePicker.ImagePickerResult) => {
        if (!result.canceled && result.assets?.[0]) {
            setState(prev => ({
                ...prev,
                imageUri: result.assets[0].uri,
                generatedMenu: null
            }));
        }
    };

    const handleImagePress = () => {
        if (state.isProcessing) return;

        if (state.imageUri) {
            Alert.alert(
                "Alterar Imagem",
                "Deseja remover a imagem atual ou escolher outra?",
                [
                    { text: "Cancelar", style: "cancel" },
                    {
                        text: "Remover Imagem",
                        onPress: () => setState(prev => ({
                            ...prev,
                            imageUri: null,
                            generatedMenu: null
                        })),
                        style: 'destructive'
                    },
                    { text: "Escolher Outra", onPress: showImageSourceOptions },
                ]
            );
        } else {
            showImageSourceOptions();
        }
    };

    const showImageSourceOptions = () => {
        Alert.alert(
            "Carregar Imagem do Cardápio",
            "Escolha de onde carregar a imagem:",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Tirar Foto", onPress: () => pickImage(true) },
                { text: "Escolher da Galeria", onPress: () => pickImage(false) },
            ]
        );
    };

    const handleProcessImage = async () => {
        if (!state.imageUri) {
            Alert.alert("Nenhuma Imagem", "Por favor, carregue uma imagem primeiro.");
            return;
        }

        setState(prev => ({ ...prev, isProcessing: true }));

        try {
            const extractedText = await processImageWithOCR(state.imageUri);
            const matchedDishes = matchDishesWithOCR(extractedText, dishes || []);

            setState(prev => ({
                ...prev,
                isProcessing: false,
                matchedDishes,
                selectedDishIds: new Set(matchedDishes.map(dish => dish._id)),
                isSelectionModalVisible: true
            }));
        } catch (error) {
            console.error(error);
            Alert.alert("Erro", "Não foi possível processar o cardápio.");
            setState(prev => ({ ...prev, isProcessing: false }));
        }
    };

    const handleToggleDish = useCallback((dishId: string) => {
        setState(prev => {
            const newSelectedDishIds = new Set(prev.selectedDishIds);
            if (newSelectedDishIds.has(dishId)) {
                newSelectedDishIds.delete(dishId);
            } else {
                newSelectedDishIds.add(dishId);
            }
            return { ...prev, selectedDishIds: newSelectedDishIds };
        });
    }, []);

    const handleGenerateMenu = useCallback(() => {
        const selectedDishes = dishes?.filter(dish => state.selectedDishIds.has(dish._id)) || [];
        const menuContent = generateMenuContent(selectedDishes);
        const fullMenu = `${state.headerText}\n\n${menuContent}\n${state.footerText}`;

        setState(prev => ({
            ...prev,
            generatedMenu: fullMenu,
            isSelectionModalVisible: false
        }));

        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: 300, animated: true });
        }
    }, [dishes, state.selectedDishIds, state.headerText, state.footerText]);

    const handleCancelSelection = useCallback(() => {
        setState(prev => ({
            ...prev,
            isSelectionModalVisible: false,
            selectedDishIds: new Set()
        }));
    }, []);

    const handleHeaderChange = useCallback(async (text: string) => {
        setState(prev => ({ ...prev, headerText: text }));
        try {
            await upsertHeader({
                content: text
            });
        } catch (error) {
            console.error("Error updating header:", error);
            Alert.alert("Erro", "Não foi possível salvar o cabeçalho.");
        }
    }, [upsertHeader]);

    const handleFooterChange = useCallback(async (text: string) => {
        setState(prev => ({ ...prev, footerText: text }));
        try {
            await upsertFooter({
                content: text
            });
        } catch (error) {
            console.error("Error updating footer:", error);
            Alert.alert("Erro", "Não foi possível salvar o rodapé.");
        }
    }, [upsertFooter]);

    const handleGeneratePress = useCallback(() => {
        setState(prev => ({
            ...prev,
            selectedDishIds: new Set(),
            isSelectionModalVisible: true
        }));
    }, []);

    const handleBackPress = () => {
        router.back();
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingContainer}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
                <TransparentHeader
                    title="Gerar Cardápio"
                    backButton={true}
                    onBackPress={handleBackPress}
                    icon={null}
                />

                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.subtitle}>Escolha como deseja gerar o cardápio:</Text>

                    <View style={styles.actionsContainer}>
                        <ActionCard
                            icon="list"
                            title="Selecionar Manualmente"
                            subtitle="Escolha os pratos diretamente da lista"
                            onPress={handleGeneratePress}
                        />
                        <ActionCard
                            icon="camera"
                            title="Usar Imagem"
                            subtitle="Gere a partir de uma foto do cardápio"
                            onPress={handleImagePress}
                        />
                    </View>

                    {state.imageUri && (
                        <View style={styles.imagePreviewContainer}>
                            <Text style={styles.sectionTitle}>Imagem Selecionada</Text>
                            <ImageUploadSection
                                imageUri={state.imageUri}
                                onImagePress={handleImagePress}
                                isProcessing={state.isProcessing}
                            />
                            <ProcessButton
                                isProcessing={state.isProcessing}
                                onPress={handleProcessImage}
                            />
                        </View>
                    )}

                    {dishes && state.selectedDishIds.size > 0 && state.generatedMenu && (
                        <GeneratedMenuSection
                            selectedDishes={dishes.filter(dish => state.selectedDishIds.has(dish._id))}
                            generatedMenu={state.generatedMenu}
                        />
                    )}

                    <View style={styles.editorContainer}>
                        <Text style={styles.sectionTitle}>Personalização</Text>
                        <View style={styles.editorSectionsContainer}>
                            <TextEditorSection
                                key="header"
                                title="Cabeçalho"
                                initialText={state.headerText}
                                onTextChange={handleHeaderChange}
                                placeholder="Digite o cabeçalho do cardápio..."
                                emptyIcon="type"
                                emptyLabel="Nenhum cabeçalho definido"
                                isLoading={activeHeader === undefined}
                            />

                            <TextEditorSection
                                key="footer"
                                title="Rodapé"
                                initialText={state.footerText}
                                onTextChange={handleFooterChange}
                                placeholder="Digite o rodapé do cardápio..."
                                emptyIcon="file-text"
                                emptyLabel="Nenhum rodapé definido"
                                isLoading={activeFooter === undefined}
                            />

                            {(activeHeader === undefined || activeFooter === undefined) && (
                                <LoadingOverlay
                                    size="small"
                                    backgroundColor={COLORS.white}
                                    overlayOpacity={0.7}
                                />
                            )}
                        </View>
                    </View>
                </ScrollView>

                <DishSelectionModal
                    visible={state.isSelectionModalVisible}
                    matchedDishes={state.matchedDishes}
                    allDishes={dishes || []}
                    selectedDishIds={state.selectedDishIds}
                    onToggleDish={handleToggleDish}
                    onCancel={handleCancelSelection}
                    onConfirm={handleGenerateMenu}
                />
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    keyboardAvoidingContainer: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContainer: {
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 120,
    },
    actionsContainer: {
        gap: 16,
        marginBottom: 24,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    actionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.black,
        marginBottom: 4,
    },
    actionSubtitle: {
        fontSize: 14,
        color: COLORS.gray[500],
    },
    imagePreviewContainer: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.black,
        marginBottom: 16,
    },
    editorContainer: {
        gap: 16,
        marginTop: 8,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.gray[500],
        marginBottom: 24,
    },
    editorSectionsContainer: {
        position: 'relative',
        gap: 16,
    },
});