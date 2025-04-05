import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MENU_HEADER = "Bom dia!\n\nSegue o cardápio para marmitex:";
const MENU_FOOTER = "📃Cardápio sujeito a alteração ao longo do expediente.\n📝 Para realizar seu pedido, mande a mensagem no privado da conta do Restaurante Cozinha & Cia.\n👨‍🍳Nosso tempero é nosso toque!\n🍝Self service | Marmitex | Marmita \n📍Seg. à Sex. - 10h45 às 14h - Sáb. - 10h45 às 14h30\n📞3403-7869\n📞98141-4737 \n❤Amamos a Cozinha & a Sua CIA";

const SAMPLE_DISHES = [
    "🍚Arroz", "🥘Feijão", "🥩Carne de Panela", "🐓Frango Grelhado", "🍖Copa Lombo Assada",
    "🍆Berinjela à Milanesa", "🥔Batata Rústica", "🍝Macarrão Pizza", "🍌Banana Frita",
    "🍟Batata Frita", "🍳Omelete de Forno", "🥦Chuchu Refogado", "🥦Brócolis com Bacon",
    "🥕Cenoura", "🥗Tabule", "🍍Abacaxi", "🥬Alface", "🍠Beterraba", "🥬Rúcula",
    "🥒Pepino", "🍅Tomate", "🍅Vinagrete", "🥭Manga", "🥗Mandioca ao Molho de Alho"
];

export default function MenuGenerationScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [selectedDishes, setSelectedDishes] = useState<string[]>([]);

    const handleDishSelection = (dish: string) => {
        setSelectedDishes(prev =>
            prev.includes(dish)
                ? prev.filter((item) => item !== dish)
                : [...prev, dish]
        );
    };

    const handleGenerateMenu = () => {
        if (selectedDishes.length === 0) {
            Alert.alert("Seleção Vazia", "Por favor, selecione pelo menos um prato para gerar o cardápio.");
            return;
        }
        const generatedMenu = `${MENU_HEADER}\n\n${selectedDishes.join('\n')}\n\n${MENU_FOOTER}`;
        // --- TODO: Implement actual action ---
        // Options: Copy to clipboard, Share via WhatsApp/Other, etc.
        console.log('--- Generated Menu ---');
        console.log(generatedMenu);
        Alert.alert('Cardápio Gerado', 'O cardápio foi montado (verifique o console). A funcionalidade de compartilhar/copiar será adicionada.', [
            { text: 'OK' }
        ]);
        // Example: Copy to clipboard (requires expo-clipboard)
        // import * as Clipboard from 'expo-clipboard';
        // await Clipboard.setStringAsync(generatedMenu);
        // Alert.alert('Copiado!', 'Cardápio copiado para a área de transferência.');
        // --- ---
    };

    const handleUploadImage = () => {
        // --- TODO: Implement image upload & OCR ---
        console.log('Upload image pressed');
        Alert.alert('Em Breve', 'A funcionalidade de gerar cardápio por imagem ainda não está disponível.');
        // --- ---
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <Stack.Screen options={{
                title: 'Gerar Cardápio do Dia',
                headerStyle: { backgroundColor: COLORS.background },
                headerTitleStyle: { color: COLORS.primary },
                headerTintColor: COLORS.secondary,
                headerShown: true,
            }} />

            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Cabeçalho Fixo</Text>
                    <Text style={styles.menuText}>{MENU_HEADER}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Selecione os Pratos do Dia</Text>
                    <View style={styles.dishListContainer}>
                        {SAMPLE_DISHES.map((dish) => (
                            <TouchableOpacity
                                key={dish}
                                style={[
                                    styles.dishItem,
                                    selectedDishes.includes(dish) && styles.selectedDish
                                ]}
                                onPress={() => handleDishSelection(dish)}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.dishText,
                                    selectedDishes.includes(dish) && styles.selectedDishText
                                ]}>
                                    {dish}
                                </Text>
                                {selectedDishes.includes(dish) && (
                                    <Feather name="check-circle" size={18} color={COLORS.white} style={styles.checkIcon} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Rodapé Fixo</Text>
                    <Text style={styles.menuText}>{MENU_FOOTER}</Text>
                </View>

            </ScrollView>

            <View style={[styles.buttonContainer, { paddingBottom: Platform.OS === 'ios' ? 15 : 10 }]}>
                <TouchableOpacity style={[styles.actionButton, styles.uploadButton]} onPress={handleUploadImage} activeOpacity={0.7}>
                    <Feather name="image" size={18} color={COLORS.secondary} />
                    <Text style={[styles.buttonText, styles.uploadButtonText]}>Via Imagem</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.actionButton,
                        styles.generateButton,
                        selectedDishes.length === 0 && styles.actionButtonDisabled
                    ]}
                    onPress={handleGenerateMenu}
                    disabled={selectedDishes.length === 0}
                    activeOpacity={selectedDishes.length === 0 ? 1 : 0.7}
                >
                    <Feather name="send" size={18} color={COLORS.white} />
                    <Text style={[styles.buttonText, styles.generateButtonText]}>Gerar Texto</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContainer: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 100,
    },
    section: {
        marginBottom: 20,
        backgroundColor: COLORS.white,
        borderRadius: 8,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.primary,
        marginBottom: 12,
        paddingBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    menuText: {
        fontSize: 14,
        color: '#444',
        lineHeight: 21,
    },
    dishListContainer: {
        // No specific styles needed if items stack vertically
    },
    dishItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 12,
        marginBottom: 8,
        borderRadius: 6,
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#eee',
    },
    selectedDish: {
        backgroundColor: COLORS.secondary,
        borderColor: COLORS.secondary,
    },
    dishText: {
        fontSize: 15,
        color: '#333',
        flex: 1,
        marginRight: 10,
    },
    selectedDishText: {
        color: COLORS.white,
        fontWeight: '500',
    },
    checkIcon: {
        marginLeft: 5,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 10,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        elevation: 5,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 5,
        height: 48,
    },
    uploadButton: {
        backgroundColor: COLORS.white,
        borderWidth: 1.5,
        borderColor: COLORS.secondary,
    },
    generateButton: {
        backgroundColor: COLORS.secondary,
    },
    actionButtonDisabled: {
        backgroundColor: '#cccccc',
        borderColor: '#cccccc',
    },
    buttonText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    uploadButtonText: {
        color: COLORS.secondary,
    },
    generateButtonText: {
        color: COLORS.white,
    }
});