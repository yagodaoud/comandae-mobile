import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import * as Clipboard from 'expo-clipboard';
import { WebView } from 'react-native-webview';
import { Doc } from '@/convex/_generated/dataModel';

interface GeneratedMenuSectionProps {
    generatedMenu: string;
    selectedDishes: Doc<'dishes'>[];
}

const GeneratedMenuSection: React.FC<GeneratedMenuSectionProps> = ({ generatedMenu, selectedDishes }) => {
    const [isPDFModalVisible, setIsPDFModalVisible] = useState(false);

    const copyToClipboard = async () => {
        await Clipboard.setStringAsync(generatedMenu);
    };

    const generateQuadrantHTML = (dishes: Doc<'dishes'>[], quadrantIndex: number) => {
        const categories = {
            rice_and_beans: dishes.filter(d => d.categoryId === 'rice' || d.categoryId === 'beans'),
            meats: dishes.filter(d => d.categoryId === 'meats'),
            sides: dishes.filter(d => d.categoryId === 'sides'),
            salads: dishes.filter(d => d.categoryId === 'salads')
        };

        const riceAndBeans = categories.rice_and_beans
            .reduce((acc, item) => {
                if (item.categoryId === 'rice') {
                    acc.rice.push(item.name.replace(/[^\w\s|]/g, '').trim());
                } else if (item.categoryId === 'beans') {
                    acc.beans.push(item.name.replace(/[^\w\s|]/g, '').trim());
                }
                return acc;
            }, { rice: [] as string[], beans: [] as string[] });

        const meatsHtml = categories.meats
            .reduce((acc: string[], item, index, array) => {
                const name = item.name.replace(/[^\w\s|]/g, '').trim();
                if (index % 2 === 0) {
                    const nextItem = array[index + 1];
                    if (nextItem) {
                        const nextName = nextItem.name.replace(/[^\w\s|]/g, '').trim();
                        if ((name.length + nextName.length) <= 35) {
                            acc.push(`${name} | ${nextName}`);
                            return acc;
                        }
                    }
                }
                if (index % 2 === 0 || index === array.length - 1) {
                    acc.push(name);
                }
                return acc;
            }, [])
            .map(text => `<div class="dish-item">${text}</div>`)
            .join('');

        const sidesHtml = categories.sides
            .map(item => `<div class="dish-item">${item.name.replace(/[^\w\s|]/g, '').trim()}</div>`)
            .join('');

        const saladsHtml = categories.salads
            .reduce((acc: string[], item) => {
                const name = item.name.replace(/[^\w\s|]/g, '').trim();
                const currentLine = acc[acc.length - 1] || '';
                const newText = currentLine ? `${currentLine}      ${name}` : name;

                if (newText.length <= 35) {
                    acc[acc.length - 1] = newText;
                } else {
                    acc.push(name);
                }
                return acc;
            }, [''])
            .map(text => `<div class="dish-item">${text}</div>`)
            .join('');

        return `
            <div class="quadrant quadrant-${quadrantIndex}">
                ${riceAndBeans.rice.length > 0 ?
                `<div class="dish-item">${riceAndBeans.rice.join(' | ')}</div>` : ''}
                ${riceAndBeans.beans.length > 0 ?
                `<div class="dish-item">${riceAndBeans.beans.join(' | ')}</div>` : ''}
                ${meatsHtml}
                ${sidesHtml}
                ${saladsHtml}
            </div>
        `;
    };

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                @page {
                    size: A4;
                    margin: 0;
                }
                body {
                    font-family: Helvetica, Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    width: 100%;
                    height: 100vh;
                }
                .page {
                    width: 595px;
                    height: 842px;
                    position: relative;
                    padding: 30px;
                    box-sizing: border-box;
                }
                .divider {
                    position: absolute;
                    left: 50%;
                    top: 30px;
                    bottom: 30px;
                    width: 1px;
                    background-color: #000;
                }
                .quadrant {
                    width: calc(50% - 30px);
                    padding: 0 15px;
                    box-sizing: border-box;
                }
                .quadrant-0, .quadrant-1 {
                    float: left;
                }
                .quadrant-2, .quadrant-3 {
                    float: right;
                }
                .dish-item {
                    font-size: 14px;
                    line-height: 1.5;
                    margin-bottom: 14px;
                }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="divider"></div>
                ${generateQuadrantHTML(selectedDishes, 0)}
                ${generateQuadrantHTML(selectedDishes, 1)}
                ${generateQuadrantHTML(selectedDishes, 2)}
                ${generateQuadrantHTML(selectedDishes, 3)}
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
                        <MaterialIcons name="picture-as-pdf" size={24} color={COLORS.white} />
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