import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import * as Clipboard from 'expo-clipboard';
import { WebView } from 'react-native-webview';
import { Doc } from '@/convex/_generated/dataModel';

interface GeneratedMenuSectionProps {
    generatedMenu: string;
}

const GeneratedMenuSection: React.FC<GeneratedMenuSectionProps> = ({ generatedMenu }) => {
    const [isPDFModalVisible, setIsPDFModalVisible] = useState(false);

    const copyToClipboard = async () => {
        await Clipboard.setStringAsync(generatedMenu);
    };

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                    white-space: pre-wrap;
                }
                .menu-content {
                    font-size: 14px;
                    line-height: 1.5;
                }
            </style>
        </head>
        <body>
            <div class="menu-content">
                ${generatedMenu}
            </div>
        </body>
        </html>
    `;

    return (
        <View style={styles.resultSection}>
            <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>Cardápio Gerado</Text>
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.pdfButton]}
                        onPress={() => setIsPDFModalVisible(true)}
                    >
                        <Feather name="file-text" size={18} color={COLORS.white} />
                        <Text style={styles.actionButtonText}>PDF</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.copyButton]}
                        onPress={copyToClipboard}
                    >
                        <Feather name="copy" size={18} color={COLORS.white} />
                        <Text style={styles.actionButtonText}>Copiar</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.generatedMenuContainer}>
                <Text style={styles.generatedMenuText}>{generatedMenu}</Text>
            </View>

            <Modal
                visible={isPDFModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setIsPDFModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Visualização do PDF</Text>
                            <TouchableOpacity
                                onPress={() => setIsPDFModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <Feather name="x" size={24} color={COLORS.black} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.webviewContainer}>
                            <WebView
                                source={{ html: htmlContent }}
                                style={styles.webview}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
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
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        minWidth: 80,
        justifyContent: 'center',
    },
    copyButton: {
        backgroundColor: COLORS.secondary,
    },
    pdfButton: {
        backgroundColor: COLORS.secondary,
    },
    actionButtonText: {
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
        color: COLORS.black ?? '#222',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        width: '90%',
        height: '85%',
        borderRadius: 16,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.black,
    },
    closeButton: {
        padding: 8,
    },
    webviewContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    webview: {
        flex: 1,
    },
});

export default GeneratedMenuSection;