import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

const ProcessButton = ({ isProcessing, onPress }) => {
    return (
        <View style={styles.processContainer}>
            {isProcessing ? (
                <ActivityIndicator size="large" color={COLORS.secondary} />
            ) : (
                <TouchableOpacity
                    style={styles.processButton}
                    onPress={onPress}
                    activeOpacity={0.8}
                >
                    <Feather name="settings" size={20} color={COLORS.white} />
                    <Text style={styles.processButtonText}>Processar Cardápio</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
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
});

export default ProcessButton;