import React, { useState, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform,
    Alert, Image, TextInput, ActivityIndicator, Keyboard,
    KeyboardAvoidingView, ToastAndroid, Clipboard
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

const INITIAL_MENU_HEADER = "Bom dia!\n\nSegue o cardápio para marmitex:";
const INITIAL_MENU_FOOTER = "📃Cardápio sujeito a alteração ao longo do expediente.\n📝 Para realizar seu pedido, mande a mensagem no privado da conta do Restaurante Cozinha & Cia.\n👨‍🍳Nosso tempero é nosso toque!\n🍝Self service | Marmitex | Marmita \n📍Seg. à Sex. - 10h45 às 14h - Sáb. - 10h45 às 14h30\n📞3403-7869\n📞98141-4737 \n❤Amamos a Cozinha & a Sua CIA";

export default function MenuGenerationScreen() {
    const insets = useSafeAreaInsets();
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [headerText, setHeaderText] = useState<string>(INITIAL_MENU_HEADER);
    const [footerText, setFooterText] = useState<string>(INITIAL_MENU_FOOTER);
    const [tempHeaderText, setTempHeaderText] = useState<string>(INITIAL_MENU_HEADER);
    const [tempFooterText, setTempFooterText] = useState<string>(INITIAL_MENU_FOOTER);
    const [isEditingHeader, setIsEditingHeader] = useState<boolean>(false);
    const [isEditingFooter, setIsEditingFooter] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [generatedMenu, setGeneratedMenu] = useState<string | null>(null);

    const headerInputRef = useRef<TextInput>(null);
    const footerInputRef = useRef<TextInput>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    const pickImage = async (useCamera: boolean = false) => {
        let result;
        const options: ImagePicker.ImagePickerOptions = {
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
            await new Promise(resolve => setTimeout(resolve, 2000));
            const fakeMenuContent = generateFakeMenuItems();
            const fullMenu = `${headerText}\n\n${fakeMenuContent}\n\n${footerText}`;
            setGeneratedMenu(fullMenu);

            setTimeout(() => {
                scrollViewRef.current?.scrollTo({ y: 300, animated: true });
            }, 500);

        } catch (error) {
            Alert.alert("Erro", "Não foi possível processar o cardápio.");
        } finally {
            setIsProcessing(false);
        }
    };

    const copyToClipboard = () => {
        if (generatedMenu) {
            Clipboard.setString(generatedMenu);
            if (Platform.OS === 'android') {
                ToastAndroid.show('Cardápio copiado para a área de transferência!', ToastAndroid.SHORT);
            } else {
                Alert.alert("Sucesso", "Cardápio copiado para a área de transferência!");
            }
        }
    };

    const startEditingHeader = () => {
        setTempHeaderText(headerText);
        setIsEditingHeader(true);
        setTimeout(() => {
            headerInputRef.current?.focus();
        }, 100);
    };

    const startEditingFooter = () => {
        setTempFooterText(footerText);
        setIsEditingFooter(true);
        setTimeout(() => {
            footerInputRef.current?.focus();
        }, 100);
    };

    const saveHeaderText = () => {
        setHeaderText(tempHeaderText);
        setIsEditingHeader(false);
        Keyboard.dismiss();
        if (headerText !== tempHeaderText && generatedMenu) {
            setGeneratedMenu(null);
        }
    };

    const cancelHeaderEdit = () => {
        setTempHeaderText(headerText);
        setIsEditingHeader(false);
        Keyboard.dismiss();
    };

    const saveFooterText = () => {
        setFooterText(tempFooterText);
        setIsEditingFooter(false);
        Keyboard.dismiss();
        if (footerText !== tempFooterText && generatedMenu) {
            setGeneratedMenu(null);
        }
    };

    const cancelFooterEdit = () => {
        setTempFooterText(footerText);
        setIsEditingFooter(false);
        Keyboard.dismiss();
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
                    <Text style={styles.areaTitle}>Imagem do Cardápio</Text>
                    <TouchableOpacity
                        style={styles.imageUploadArea}
                        onPress={handleImagePress}
                        activeOpacity={0.7}
                        disabled={isProcessing}
                    >
                        {imageUri ? (
                            <Image source={{ uri: imageUri }} style={styles.previewImage} />
                        ) : (
                            <View style={styles.uploadPrompt}>
                                <Feather name="camera" size={40} color={COLORS.secondary} />
                                <Text style={styles.uploadText}>Toque para carregar ou tirar foto</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {imageUri && (
                        <View style={styles.processContainer}>
                            {isProcessing ? (
                                <ActivityIndicator size="large" color={COLORS.secondary} />
                            ) : (
                                <TouchableOpacity
                                    style={styles.processButton}
                                    onPress={handleProcessImage}
                                    activeOpacity={0.8}
                                >
                                    <Feather name="settings" size={20} color={COLORS.white} />
                                    <Text style={styles.processButtonText}>Processar Cardápio</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {generatedMenu && (
                        <View style={styles.resultSection}>
                            <View style={styles.resultHeader}>
                                <Text style={styles.resultTitle}>Cardápio Gerado</Text>
                                <TouchableOpacity
                                    style={styles.copyButton}
                                    onPress={copyToClipboard}
                                >
                                    <Feather name="copy" size={18} color={COLORS.white} />
                                    <Text style={styles.copyButtonText}>Copiar</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.generatedMenuContainer}>
                                <Text style={styles.generatedMenuText}>{generatedMenu}</Text>
                            </View>
                        </View>
                    )}

                    <View style={styles.textSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Cabeçalho</Text>
                            {!isEditingHeader && (
                                <TouchableOpacity onPress={startEditingHeader} style={styles.editButton}>
                                    <Feather name="edit-2" size={18} color={COLORS.secondary} />
                                </TouchableOpacity>
                            )}
                        </View>
                        {isEditingHeader ? (
                            <View>
                                <TextInput
                                    ref={headerInputRef}
                                    style={styles.textInputSection}
                                    value={tempHeaderText}
                                    onChangeText={setTempHeaderText}
                                    multiline
                                    blurOnSubmit={false}
                                    returnKeyType="next"
                                    placeholder="Digite o cabeçalho do cardápio..."
                                    placeholderTextColor={COLORS.textSecondary ?? '#888'}
                                />
                                <View style={styles.editButtonsContainer}>
                                    <TouchableOpacity
                                        style={styles.cancelEditButton}
                                        onPress={cancelHeaderEdit}
                                    >
                                        <Feather name="x" size={16} color={COLORS.error ?? '#e53935'} />
                                        <Text style={styles.cancelEditText}>Cancelar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.saveEditButton}
                                        onPress={saveHeaderText}
                                    >
                                        <Feather name="check" size={16} color={COLORS.success ?? '#4caf50'} />
                                        <Text style={styles.saveEditText}>Salvar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <Text style={styles.menuTextDisplay}>
                                {headerText || "Nenhum cabeçalho definido"}
                            </Text>
                        )}
                    </View>

                    <View style={styles.textSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Rodapé</Text>
                            {!isEditingFooter && (
                                <TouchableOpacity onPress={startEditingFooter} style={styles.editButton}>
                                    <Feather name="edit-2" size={18} color={COLORS.secondary} />
                                </TouchableOpacity>
                            )}
                        </View>
                        {isEditingFooter ? (
                            <View>
                                <TextInput
                                    ref={footerInputRef}
                                    style={styles.textInputSection}
                                    value={tempFooterText}
                                    onChangeText={setTempFooterText}
                                    multiline
                                    blurOnSubmit={false}
                                    returnKeyType="next"
                                    placeholder="Digite o rodapé do cardápio..."
                                    placeholderTextColor={COLORS.textSecondary ?? '#888'}
                                />
                                <View style={styles.editButtonsContainer}>
                                    <TouchableOpacity
                                        style={styles.cancelEditButton}
                                        onPress={cancelFooterEdit}
                                    >
                                        <Feather name="x" size={16} color={COLORS.error ?? '#e53935'} />
                                        <Text style={styles.cancelEditText}>Cancelar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.saveEditButton}
                                        onPress={saveFooterText}
                                    >
                                        <Feather name="check" size={16} color={COLORS.success ?? '#4caf50'} />
                                        <Text style={styles.saveEditText}>Salvar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <Text style={styles.menuTextDisplay}>
                                {footerText || "Nenhum rodapé definido"}
                            </Text>
                        )}
                    </View>
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
    },
    areaTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.primary ?? '#333',
        marginBottom: 10,
    },
    imageUploadArea: {
        height: 220,
        borderWidth: 2,
        borderColor: COLORS.secondary ?? '#aaa',
        borderStyle: 'dashed',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        overflow: 'hidden',
        marginBottom: 20,
    },
    uploadPrompt: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    uploadText: {
        marginTop: 12,
        fontSize: 14,
        color: COLORS.textSecondary ?? '#555',
        textAlign: 'center',
        fontWeight: '500',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    processContainer: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 10,
    },
    processButton: {
        flexDirection: 'row',
        backgroundColor: COLORS.secondary ?? '#007bff',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
    },
    processButtonText: {
        color: COLORS.white ?? '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 10,
    },
    textSection: {
        marginBottom: 25,
        backgroundColor: COLORS.white ?? '#fff',
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.primary ?? '#333',
    },
    editButton: {
        padding: 5,
    },
    editButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
        gap: 10,
    },
    cancelEditButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        backgroundColor: '#ffebee',
    },
    saveEditButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        backgroundColor: '#e8f5e9',
    },
    cancelEditText: {
        marginLeft: 5,
        color: COLORS.error ?? '#e53935',
        fontWeight: '500',
        fontSize: 14,
    },
    saveEditText: {
        marginLeft: 5,
        color: COLORS.success ?? '#4caf50',
        fontWeight: '500',
        fontSize: 14,
    },
    menuTextDisplay: {
        fontSize: 14,
        color: COLORS.textPrimary ?? '#222',
        lineHeight: 22,
        paddingVertical: 5,
    },
    textInputSection: {
        fontSize: 14,
        color: COLORS.textPrimary ?? '#222',
        lineHeight: 22,
        padding: 10,
        backgroundColor: '#f8f9fa',
        borderRadius: 6,
        minHeight: 80,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    resultSection: {
        backgroundColor: COLORS.white,
        borderRadius: 10,
        padding: 18,
        marginTop: 10,
        marginBottom: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    resultTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.primary ?? '#333',
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.secondary ?? '#6c757d',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    copyButtonText: {
        color: COLORS.white ?? '#fff',
        fontSize: 13,
        fontWeight: '500',
        marginLeft: 5,
    },
    generatedMenuContainer: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#eaeaea',
    },
    generatedMenuText: {
        fontSize: 14,
        lineHeight: 22,
        color: COLORS.textPrimary ?? '#222',
    }
});