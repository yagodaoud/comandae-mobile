import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform, Keyboard, KeyboardAvoidingView } from 'react-native';
import { COLORS } from '@/constants/theme';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Doc, Id } from '@/convex/_generated/dataModel';

import ImageUploadSection from './ImageUploadSection';
import ProcessButton from './ProcessButton';
import GeneratedMenuSection from './GeneratedMenuSection';
import TextEditorSection from './TextEditorSection';
import { DishSelectionModal } from './DishSelectionModal';
import { matchDishesWithOCR, processImageWithOCR, generateMenuContent } from '@/utils/ocrUtils';
import { useAllDishes } from '../hooks/useDishes';

const INITIAL_MENU_HEADER = "Bom dia!\n\nSegue o cardápio para marmitex:";
const INITIAL_MENU_FOOTER = "📃Cardápio sujeito a alteração ao longo do expediente.\n📝 Para realizar seu pedido, mande a mensagem no privado da conta do Restaurante Cozinha & Cia.\n👨‍🍳Nosso tempero é nosso toque!\n🍝Self service | Marmitex | Marmita \n📍Seg. à Sex. - 10h45 às 14h - Sáb. - 10h45 às 14h30\n📞3403-7869\n📞98141-4737 \n❤Amamos a Cozinha & a Sua CIA";

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

export default function MenuGenerationScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const scrollViewRef = useRef<ScrollView>(null);

    const [state, setState] = useState<State>({
        imageUri: null,
        headerText: INITIAL_MENU_HEADER,
        footerText: INITIAL_MENU_FOOTER,
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

    useEffect(() => {
        // No need to manually clean up React refs
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

            // Initially select only the matched dishes
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
        // Get the selected dishes from all dishes
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

    const handleHeaderChange = useCallback((text: string) => {
        setState(prev => ({ ...prev, headerText: text }));
    }, []);

    const handleFooterChange = useCallback((text: string) => {
        setState(prev => ({ ...prev, footerText: text }));
    }, []);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingContainer}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <ImageUploadSection
                        imageUri={state.imageUri}
                        onImagePress={handleImagePress}
                        isProcessing={state.isProcessing}
                    />

                    {state.imageUri && (
                        <ProcessButton
                            isProcessing={state.isProcessing}
                            onPress={handleProcessImage}
                        />
                    )}

                    {state.generatedMenu && (
                        <GeneratedMenuSection
                            generatedMenu={state.generatedMenu}
                        />
                    )}

                    <TextEditorSection
                        key="header"
                        title="Cabeçalho"
                        initialText={state.headerText}
                        onTextChange={handleHeaderChange}
                        placeholder="Digite o cabeçalho do cardápio..."
                    />

                    <TextEditorSection
                        key="footer"
                        title="Rodapé"
                        initialText={state.footerText}
                        onTextChange={handleFooterChange}
                        placeholder="Digite o rodapé do cardápio..."
                    />
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
    }
});