import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform, Keyboard, KeyboardAvoidingView } from 'react-native';
import { COLORS } from '@/constants/theme';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import ImageUploadSection from './ImageUploadSection';
import ProcessButton from './ProcessButton';
import GeneratedMenuSection from './GeneratedMenuSection';
import TextEditorSection from './TextEditorSection';
import { matchDishesWithOCR, processImageWithOCR } from '@/utils/ocrUtils';

const INITIAL_MENU_HEADER = "Bom dia!\n\nSegue o cardápio para marmitex:";
const INITIAL_MENU_FOOTER = "📃Cardápio sujeito a alteração ao longo do expediente.\n📝 Para realizar seu pedido, mande a mensagem no privado da conta do Restaurante Cozinha & Cia.\n👨‍🍳Nosso tempero é nosso toque!\n🍝Self service | Marmitex | Marmita \n📍Seg. à Sex. - 10h45 às 14h - Sáb. - 10h45 às 14h30\n📞3403-7869\n📞98141-4737 \n❤Amamos a Cozinha & a Sua CIA";

export default function MenuGenerationScreen() {
    const insets = useSafeAreaInsets();
    const [imageUri, setImageUri] = useState(null);
    const [headerText, setHeaderText] = useState(INITIAL_MENU_HEADER);
    const [footerText, setFooterText] = useState(INITIAL_MENU_FOOTER);
    const [isProcessing, setIsProcessing] = useState(false);
    const [generatedMenu, setGeneratedMenu] = useState(null);

    const scrollViewRef = useRef(null);

    const pickImage = async (useCamera = false) => {
        let result;
        const options = {
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 5],
            quality: 0.8,
        };

        try {
            if (useCamera) {
                const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
                if (!cameraPermission.granted) {
                    Alert.alert("Permissão Necessária", "Acesso à câmera é necessário para tirar foto.");
                    return;
                }
                result = await ImagePicker.launchCameraAsync(options);
            } else {
                const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (!libraryPermission.granted) {
                    Alert.alert("Permissão Necessária", "Acesso à galeria é necessário para escolher uma imagem.");
                    return;
                }
                result = await ImagePicker.launchImageLibraryAsync(options);
            }

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setImageUri(result.assets[0].uri);
                setGeneratedMenu(null);
            }
        } catch (error) {
            console.error("ImagePicker Error: ", error);
            Alert.alert("Erro", "Não foi possível carregar a imagem.");
        }
    };

    const handleImagePress = () => {
        if (isProcessing) return;

        if (imageUri) {
            Alert.alert(
                "Alterar Imagem",
                "Deseja remover a imagem atual ou escolher outra?",
                [
                    { text: "Cancelar", style: "cancel" },
                    {
                        text: "Remover Imagem", onPress: () => {
                            setImageUri(null);
                            setGeneratedMenu(null);
                        }, style: 'destructive'
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
    }

    const generateFakeMenuItems = () => {
        const mainDishes = [
            "Filé de Frango Grelhado",
            "Bife Acebolado",
            "Picadinho de Carne",
            "Filé de Peixe",
            "Carne de Panela"
        ];
        const sides = [
            "Arroz Branco",
            "Feijão Carioca",
            "Batata Frita",
            "Purê de Batata",
            "Macarrão ao Alho e Óleo"
        ];
        const salads = [
            "Salada de Folhas",
            "Salada de Tomate",
            "Vinagrete",
            "Salpicão",
            "Salada de Repolho"
        ];

        const todayMain = mainDishes[Math.floor(Math.random() * mainDishes.length)];
        const todaySide1 = sides[Math.floor(Math.random() * sides.length)];
        const todaySide2 = sides.filter(side => side !== todaySide1)[Math.floor(Math.random() * (sides.length - 1))];
        const todaySalad = salads[Math.floor(Math.random() * salads.length)];

        return `🍽️ OPÇÕES DO DIA:

🥩 Prato Principal:
• ${todayMain}

🍚 Acompanhamentos:
• ${todaySide1}
• ${todaySide2}
• ${todaySalad}

🍮 Sobremesa:
• Pudim de Leite ou Fruta

💰 Valores:
• Marmitex P: R$ 18,00
• Marmitex M: R$ 22,00
• Marmitex G: R$ 26,00`;
    };

    const handleProcessImage = async () => {
        if (!imageUri) {
            Alert.alert("Nenhuma Imagem", "Por favor, carregue uma imagem primeiro.");
            return;
        }
        setIsProcessing(true);

        try {
            // 1. Process the image with OCR
            const extractedText = await processImageWithOCR(imageUri);

            // 2. Match the extracted text with stored dishes
            const matchedDishes = matchDishesWithOCR(extractedText, storedDishes);

            // 3. Generate menu content based on matched dishes
            let menuContent = '';

            // Group dishes by category
            const categorizedDishes = {
                mainDishes: matchedDishes.filter(dish => dish.category === 'main'),
                sides: matchedDishes.filter(dish => dish.category === 'side'),
                salads: matchedDishes.filter(dish => dish.category === 'salad'),
                desserts: matchedDishes.filter(dish => dish.category === 'dessert')
            };

            // Generate formatted menu text
            menuContent += '🍽️ OPÇÕES DO DIA:\n\n';

            if (categorizedDishes.mainDishes.length > 0) {
                menuContent += '🥩 Prato Principal:\n';
                categorizedDishes.mainDishes.forEach(dish => {
                    menuContent += `• ${dish.name}\n`;
                });
                menuContent += '\n';
            }

            if (categorizedDishes.sides.length > 0) {
                menuContent += '🍚 Acompanhamentos:\n';
                categorizedDishes.sides.forEach(dish => {
                    menuContent += `• ${dish.name}\n`;
                });
                menuContent += '\n';
            }

            if (categorizedDishes.salads.length > 0) {
                menuContent += '🥗 Saladas:\n';
                categorizedDishes.salads.forEach(dish => {
                    menuContent += `• ${dish.name}\n`;
                });
                menuContent += '\n';
            }

            if (categorizedDishes.desserts.length > 0) {
                menuContent += '🍮 Sobremesa:\n';
                categorizedDishes.desserts.forEach(dish => {
                    menuContent += `• ${dish.name}\n`;
                });
                menuContent += '\n';
            }

            menuContent += '💰 Valores:\n';
            menuContent += '• Marmitex P: R$ 18,00\n';
            menuContent += '• Marmitex M: R$ 22,00\n';
            menuContent += '• Marmitex G: R$ 26,00';

            // Create the full menu
            const fullMenu = `${headerText}\n\n${menuContent}\n\n${footerText}`;
            setGeneratedMenu(fullMenu);

            // Scroll to show the result
            setTimeout(() => {
                scrollViewRef.current?.scrollTo({ y: 300, animated: true });
            }, 500);

        } catch (error) {
            console.error(error);
            Alert.alert("Erro", "Não foi possível processar o cardápio.");
        } finally {
            setIsProcessing(false);
        }
    };

    const onHeaderChange = (newText) => {
        setHeaderText(newText);
        if (generatedMenu) {
            setGeneratedMenu(null);
        }
    };

    const onFooterChange = (newText) => {
        setFooterText(newText);
        if (generatedMenu) {
            setGeneratedMenu(null);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingContainer}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            <View style={[
                styles.container,
                { paddingTop: insets.top, paddingBottom: insets.bottom }
            ]}>
                <Stack.Screen options={{
                    title: 'Gerar via Imagem',
                    headerStyle: { backgroundColor: COLORS.background },
                    headerTitleStyle: { color: COLORS.primary, fontSize: 18 },
                    headerTintColor: COLORS.secondary,
                    headerShown: true,
                    headerShadowVisible: false,
                    headerTitleAlign: 'center',
                }} />

                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <ImageUploadSection
                        imageUri={imageUri}
                        onImagePress={handleImagePress}
                        isProcessing={isProcessing}
                    />

                    {imageUri && (
                        <ProcessButton
                            isProcessing={isProcessing}
                            onPress={handleProcessImage}
                        />
                    )}

                    {generatedMenu && (
                        <GeneratedMenuSection
                            generatedMenu={generatedMenu}
                        />
                    )}

                    <TextEditorSection
                        title="Cabeçalho"
                        initialText={headerText}
                        onTextChange={onHeaderChange}
                        placeholder="Digite o cabeçalho do cardápio..."
                    />

                    <TextEditorSection
                        title="Rodapé"
                        initialText={footerText}
                        onTextChange={onFooterChange}
                        placeholder="Digite o rodapé do cardápio..."
                    />
                </ScrollView>
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