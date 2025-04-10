import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, ToastAndroid } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import * as Clipboard from 'expo-clipboard';

const GeneratedMenuSection = ({ generatedMenu }) => {
    const copyToClipboard = () => {
        if (generatedMenu) {
            Clipboard.setStringAsync(generatedMenu);
            if (Platform.OS === 'android') {
                ToastAndroid.show('Cardápio copiado para a área de transferência!', ToastAndroid.SHORT);
            } else {
                Alert.alert("Sucesso", "Cardápio copiado para a área de transferência!");
            }
        }
    };

    return (
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

export default GeneratedMenuSection;