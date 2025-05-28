import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TextInput, TouchableOpacity, ActivityIndicator, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import TransparentHeader from '@/components/TransparentHeader';
import { COLORS } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

const KEY_TYPES = [
    { id: 'cpf', name: 'CPF' },
    { id: 'cnpj', name: 'CNPJ' },
    { id: 'email', name: 'Email' },
    { id: 'phone', name: 'Telefone' },
] as const;

export default function PixConfigPage() {
    const router = useRouter();
    const pixConfig = useQuery(api.pix.getPixConfig);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<Doc<"pix">>>({
        type: 'cnpj',
        key: '',
        city: '',
        company_name: '',
        isActive: false,
    });

    const [errors, setErrors] = useState<Record<string, boolean>>({});

    const createPix = useMutation(api.pix.createPixConfig);
    const updatePix = useMutation(api.pix.updatePixConfig);

    useEffect(() => {
        if (pixConfig) {
            setFormData(pixConfig);
        }
    }, [pixConfig]);

    const handleInputChange = (field: keyof Partial<Doc<"pix">>, value: any) => {
        setFormData({ ...formData, [field]: value });
        // Clear error when field is modified
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: false }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, boolean> = {};
        if (!formData.type) newErrors.type = true;
        if (!formData.key) newErrors.key = true;
        if (!formData.city) newErrors.city = true;
        if (!formData.company_name) newErrors.company_name = true;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const toggleEditing = async () => {
        if (isEditing) {
            if (!validateForm()) {
                return;
            }
            try {
                if (pixConfig) {
                    await updatePix({
                        _id: pixConfig._id,
                        _creationTime: pixConfig._creationTime,
                        ...formData
                    } as Doc<"pix">);
                } else {
                    if (formData.type && formData.key && formData.city && formData.company_name !== undefined && formData.isActive !== undefined) {
                        await createPix({
                            type: formData.type,
                            key: formData.key,
                            city: formData.city,
                            company_name: formData.company_name,
                            isActive: formData.isActive,
                        });
                    }
                }
                console.log("Pix configuration saved successfully!");
            } catch (error) {
                console.error("Failed to save Pix configuration:", error);
            }
        }
        setIsEditing(!isEditing);
    };

    if (pixConfig === undefined) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.secondary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <TransparentHeader
                title="Configuração Pix"
                backButton
                onBackPress={() => router.back()}
                icon={<TouchableOpacity onPress={toggleEditing}>
                    <Feather name={isEditing ? "check" : "edit-2"} size={24} color={COLORS.secondary} />
                </TouchableOpacity>}
            />
            <ScrollView style={styles.content}>
                <View style={styles.configContainer}>
                    {/* Type Field (Category Selector Style) */}
                    <Text style={[styles.label, errors.type && styles.errorLabel]}>Tipo de Chave*</Text>
                    <View style={styles.categoryContainer}>
                        {KEY_TYPES.map(type => (
                            <TouchableOpacity
                                key={type.id}
                                style={[
                                    styles.categoryButton,
                                    formData.type === type.id && styles.selectedCategory,
                                    errors.type && styles.errorBorder
                                ]}
                                onPress={() => handleInputChange('type', type.id)}
                                disabled={!isEditing}
                            >
                                <Text style={[
                                    styles.categoryText,
                                    formData.type === type.id && styles.selectedCategoryText
                                ]}>
                                    {type.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Key Field */}
                    <Text style={[styles.label, errors.key && styles.errorLabel]}>Chave Pix*</Text>
                    <View style={[styles.fieldContainer, errors.key && styles.errorBorder]}>
                        {isEditing ? (
                            <TextInput
                                style={styles.valueInput}
                                value={formData.key}
                                onChangeText={(text) => handleInputChange('key', text)}
                                placeholder="Digite a chave pix"
                                placeholderTextColor={COLORS.lightGray}
                            />
                        ) : (
                            <Text style={styles.value}>{formData.key}</Text>
                        )}
                    </View>

                    {/* Company Name Field */}
                    <Text style={[styles.label, errors.company_name && styles.errorLabel]}>Nome da Empresa*</Text>
                    <View style={[styles.fieldContainer, errors.company_name && styles.errorBorder]}>
                        {isEditing ? (
                            <TextInput
                                style={styles.valueInput}
                                value={formData.company_name}
                                onChangeText={(text) => handleInputChange('company_name', text)}
                                placeholder="Digite o nome da empresa"
                                placeholderTextColor={COLORS.lightGray}
                            />
                        ) : (
                            <Text style={styles.value}>{formData.company_name}</Text>
                        )}
                    </View>

                    {/* City Field */}
                    <Text style={[styles.label, errors.city && styles.errorLabel]}>Cidade*</Text>
                    <View style={[styles.fieldContainer, errors.city && styles.errorBorder]}>
                        {isEditing ? (
                            <TextInput
                                style={styles.valueInput}
                                value={formData.city}
                                onChangeText={(text) => handleInputChange('city', text)}
                                placeholder="Digite a cidade"
                                placeholderTextColor={COLORS.lightGray}
                            />
                        ) : (
                            <Text style={styles.value}>{formData.city}</Text>
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