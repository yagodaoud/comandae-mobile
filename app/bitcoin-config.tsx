import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TextInput, TouchableOpacity, ActivityIndicator, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import TransparentHeader from '@/components/TransparentHeader';
import { COLORS } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

const NETWORK_TYPES = [
    { id: 'mainnet', name: 'Mainnet' },
    { id: 'testnet', name: 'Testnet' },
    { id: 'lightning', name: 'Lightning' },
] as const;

export default function BitcoinConfigPage() {
    const router = useRouter();
    const bitcoinConfig = useQuery(api.bitcoin.getBitcoinConfig);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<Doc<"bitcoin">>>({
        network: 'mainnet',
        address: '',
        isActive: false,
    });

    const [errors, setErrors] = useState<Record<string, boolean>>({});

    const createBitcoin = useMutation(api.bitcoin.createBitcoinConfig);
    const updateBitcoin = useMutation(api.bitcoin.updateBitcoinConfig);

    useEffect(() => {
        if (bitcoinConfig) {
            setFormData(bitcoinConfig);
        }
    }, [bitcoinConfig]);

    const handleInputChange = (field: keyof Partial<Doc<"bitcoin">>, value: any) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: false }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, boolean> = {};
        if (!formData.network) newErrors.network = true;
        if (!formData.address) newErrors.address = true;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const toggleEditing = async () => {
        if (isEditing) {
            if (!validateForm()) {
                return;
            }
            try {
                if (bitcoinConfig) {
                    await updateBitcoin({
                        _id: bitcoinConfig._id,
                        _creationTime: bitcoinConfig._creationTime,
                        ...formData
                    } as Doc<"bitcoin">);
                } else {
                    if (formData.network && formData.address !== undefined && formData.isActive !== undefined) {
                        await createBitcoin({
                            network: formData.network,
                            address: formData.address,
                            isActive: formData.isActive,
                        });
                    }
                }
                console.log("Bitcoin configuration saved successfully!");
            } catch (error) {
                console.error("Failed to save Bitcoin configuration:", error);
            }
        }
        setIsEditing(!isEditing);
    };

    if (bitcoinConfig === undefined) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.secondary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <TransparentHeader
                title="Configuração Bitcoin"
                backButton
                onBackPress={() => router.back()}
                icon={<TouchableOpacity onPress={toggleEditing}>
                    <Feather name={isEditing ? "check" : "edit-2"} size={24} color={COLORS.secondary} />
                </TouchableOpacity>}
            />
            <ScrollView style={styles.content}>
                <View style={styles.configContainer}>
                    {/* Network Type Field */}
                    <Text style={[styles.label, errors.network && styles.errorLabel]}>Rede*</Text>
                    <View style={styles.categoryContainer}>
                        {NETWORK_TYPES.map(type => (
                            <TouchableOpacity
                                key={type.id}
                                style={[
                                    styles.categoryButton,
                                    formData.network === type.id && styles.selectedCategory,
                                    errors.network && styles.errorBorder
                                ]}
                                onPress={() => handleInputChange('network', type.id)}
                                disabled={!isEditing}
                            >
                                <Text style={[
                                    styles.categoryText,
                                    formData.network === type.id && styles.selectedCategoryText
                                ]}>
                                    {type.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Address Field */}
                    <Text style={[styles.label, errors.address && styles.errorLabel]}>Endereço*</Text>
                    <View style={[styles.fieldContainer, errors.address && styles.errorBorder]}>
                        {isEditing ? (
                            <TextInput
                                style={styles.valueInput}
                                value={formData.address}
                                onChangeText={(text) => handleInputChange('address', text)}
                                placeholder="Digite o endereço Bitcoin"
                                placeholderTextColor={COLORS.lightGray}
                            />
                        ) : (
                            <Text style={styles.value}>{formData.address}</Text>
                        )}
                    </View>

                    {/* Is Active Toggle */}
                    <Text style={styles.label}>Ativo:</Text>
                    <View style={styles.fieldContainer}>
                        {isEditing ? (
                            <Switch
                                onValueChange={(value) => handleInputChange('isActive', value)}
                                value={formData.isActive}
                                thumbColor={formData.isActive ? COLORS.secondary : '#fff'}
                                ios_backgroundColor={COLORS.lightGray}
                                trackColor={{ false: COLORS.lightGray, true: COLORS.secondary }}
                            />
                        ) : (
                            <Text style={styles.value}>{formData.isActive ? 'Sim' : 'Não'}</Text>
                        )}
                    </View>
                </View>
            </ScrollView>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    configContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.secondary,
        marginTop: 8,
        marginBottom: 4,
    },
    errorLabel: {
        color: 'red',
    },
    value: {
        flex: 1,
        fontSize: 16,
        color: COLORS.gray,
    },
    valueInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.gray,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
        paddingVertical: 4,
        minHeight: 24,
    },
    fieldContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    errorBorder: {
        borderBottomColor: 'red',
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
        marginTop: 8,
    },
    categoryButton: {
        backgroundColor: '#fff',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    categoryText: {
        fontSize: 14,
        color: COLORS.gray,
    },
    selectedCategoryText: {
        color: '#fff',
    },
    selectedCategory: {
        backgroundColor: COLORS.secondary,
        borderColor: COLORS.secondary,
    },
}); 