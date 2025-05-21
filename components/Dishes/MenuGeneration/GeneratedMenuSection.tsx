import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, ScrollView } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import * as Clipboard from 'expo-clipboard';
import { Doc } from '@/convex/_generated/dataModel';
import { generateMenuPDF } from '@/utils/pdfGenerator';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface GeneratedMenuSectionProps {
    selectedDishes: Doc<'dishes'>[];
    generatedMenu: string;
}

export const GeneratedMenuSection: React.FC<GeneratedMenuSectionProps> = ({ selectedDishes, generatedMenu }) => {
    const categories = useQuery(api.dishes.listCategories);
    const [isPDFModalVisible, setIsPDFModalVisible] = useState(false);

    const handleDownloadPDF = async () => {
        try {
            if (!categories) {
                console.error('Categories not loaded yet');
                return;
            }

            const pdfUri = await generateMenuPDF(selectedDishes, categories);
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(pdfUri);
            } else {
                console.error('Sharing is not available on this device');
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    const copyToClipboard = async () => {
        await Clipboard.setStringAsync(generatedMenu);
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.menuContainer}>
                <Text style={styles.menuText}>{generatedMenu}</Text>
            </ScrollView>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={copyToClipboard}>
                    <Text style={styles.buttonText}>Copiar Menu</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={handleDownloadPDF}>
                    <Text style={styles.buttonText}>Baixar PDF</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    menuContainer: {
        flex: 1,
        marginBottom: 16,
    },
    menuText: {
        fontSize: 16,
        lineHeight: 24,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
    },
    button: {
        flex: 1,
        backgroundColor: COLORS.secondary,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default GeneratedMenuSection;