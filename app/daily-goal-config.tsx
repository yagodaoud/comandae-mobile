import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import TransparentHeader from '@/components/TransparentHeader';
import { COLORS } from '@/constants/theme';

export default function DailyGoalConfig() {
    const router = useRouter();
    const [goal, setGoal] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const config = useQuery(api.configurations.getConfig, { name: 'daily_goal' });
    const setConfig = useMutation(api.configurations.setConfig);

    useEffect(() => {
        if (config) {
            setGoal(config.value);
        }
    }, [config]);

    const handleSave = async () => {
        if (!goal) return;

        setIsLoading(true);
        try {
            await setConfig({
                name: 'daily_goal',
                value: goal,
                type: 'number',
            });
            router.back();
        } catch (error) {
            console.error('Error saving daily goal:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <TransparentHeader
                title="Meta Diária"
                backButton
                onBackPress={() => router.back()}
            />

            <View style={styles.content}>
                <View style={styles.configContainer}>
                    <Text style={styles.label}>Valor da Meta Diária (R$)</Text>
                    <TextInput
                        style={styles.input}
                        value={goal}
                        onChangeText={setGoal}
                        keyboardType="numeric"
                        placeholder="Digite o valor da meta diária"
                        placeholderTextColor={COLORS.gray}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, !goal && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={!goal || isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>Salvar</Text>
                    )}
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
    content: {
        flex: 1,
        padding: 16,
    },
    configContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.secondary,
        marginBottom: 8,
    },
    input: {
        fontSize: 16,
        color: COLORS.gray,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
        paddingVertical: 8,
    },
    saveButton: {
        backgroundColor: COLORS.secondary,
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
}); 