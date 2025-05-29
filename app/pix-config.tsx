import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TextInput, TouchableOpacity, ActivityIndicator, Switch, Alert } from 'react-native';
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

const DEFAULT_FORM_DATA = {
    type: 'cnpj',
    key: '',
    city: '',
    company_name: '',
    isActive: false,
} as const;

export default function PixConfigPage() {
    const router = useRouter();
    const pixConfigs = useQuery(api.pix.getPixConfigs);

    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Doc<"pix">>>(DEFAULT_FORM_DATA);

    const [errors, setErrors] = useState<Record<string, boolean>>({});

    const createPix = useMutation(api.pix.createPixConfig);
    const updatePix = useMutation(api.pix.updatePixConfig);
    const deletePix = useMutation(api.pix.deletePixConfig);

    const handleInputChange = (field: keyof Partial<Doc<"pix">>, value: any) => {
        setFormData({ ...formData, [field]: value });
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

    const handleNewRecord = () => {
        setEditingId(null);
        setIsEditing(true);
        setFormData(DEFAULT_FORM_DATA);
        setErrors({});
    };

    const handleEdit = (config: Doc<"pix">) => {
        setEditingId(config._id);
        setIsEditing(true);
        setFormData(config);
        setErrors({});
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            "Confirmar exclusão",
            "Tem certeza que deseja excluir este registro?",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deletePix({ _id: id });
                            console.log("Pix configuration deleted successfully!");
                        } catch (error) {
                            console.error("Failed to delete Pix configuration:", error);
                        }
                    }
                }
            ]
        );
    };

    const toggleEditing = async () => {
        if (isEditing) {
            if (!validateForm()) {
                return;
            }
            try {
                if (editingId === null) {
                    if (formData.type && formData.key && formData.city && formData.company_name !== undefined && formData.isActive !== undefined) {
                        await createPix({
                            type: formData.type,
                            key: formData.key,
                            city: formData.city,
                            company_name: formData.company_name,
                            isActive: formData.isActive,
                        });
                    }
                } else {
                    const config = pixConfigs?.find(c => c._id === editingId);
                    if (config) {
                        await updatePix({
                            _id: config._id,
                            _creationTime: config._creationTime,
                            ...formData
                        } as Doc<"pix">);
                    }
                }
                console.log("Pix configuration saved successfully!");
            } catch (error) {
                console.error("Failed to save Pix configuration:", error);
            }
        }
        setIsEditing(false);
        setEditingId(null);
    };

    if (pixConfigs === undefined) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.secondary} />
            </View>
        );
    }

    const renderConfigForm = () => (
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

            {isEditing && (
                <View style={styles.editActions}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.saveButton]}
                        onPress={toggleEditing}
                    >
                        <Feather name="check" size={20} color={COLORS.white} />
                        <Text style={styles.actionButtonText}>Salvar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.cancelButton]}
                        onPress={() => {
                            setIsEditing(false);
                            setEditingId(null);
                            setFormData(DEFAULT_FORM_DATA);
                        }}
                    >
                        <Feather name="x" size={20} color={COLORS.white} />
                        <Text style={styles.actionButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <TransparentHeader
                title="Configuração Pix"
                backButton
                onBackPress={() => router.back()}
            />
            <ScrollView style={styles.content}>
                {pixConfigs.map((config) => (
                    <View key={config._id} style={styles.configWrapper}>
                        {editingId === config._id ? (
                            renderConfigForm()
                        ) : (
                            <View style={styles.configContainer}>
                                <View style={styles.configHeader}>
                                    <Text style={styles.configTitle}>
                                        {KEY_TYPES.find(t => t.id === config.type)?.name}
                                    </Text>
                                    <View style={styles.headerActions}>
                                        <TouchableOpacity
                                            onPress={() => handleEdit(config)}
                                            style={styles.headerButton}
                                        >
                                            <Feather name="edit-2" size={20} color={COLORS.secondary} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleDelete(config._id)}
                                            style={styles.headerButton}
                                        >
                                            <Feather name="trash-2" size={20} color={COLORS.error} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <Text style={styles.label}>Chave Pix:</Text>
                                <Text style={styles.value}>{config.key}</Text>
                                <Text style={styles.label}>Nome da Empresa:</Text>
                                <Text style={styles.value}>{config.company_name}</Text>
                                <Text style={styles.label}>Cidade:</Text>
                                <Text style={styles.value}>{config.city}</Text>
                                <Text style={styles.label}>Ativo:</Text>
                                <Text style={styles.value}>{config.isActive ? 'Sim' : 'Não'}</Text>
                            </View>
                        )}
                    </View>
                ))}

                {isEditing && editingId === null && renderConfigForm()}

                {!isEditing && (
                    <TouchableOpacity
                        style={styles.newRecordButton}
                        onPress={handleNewRecord}
                    >
                        <Feather name="plus" size={20} color={COLORS.white} />
                        <Text style={styles.newRecordButtonText}>Novo Registro</Text>
                    </TouchableOpacity>
                )}
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
    configWrapper: {
        marginBottom: 16,
    },
    configContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
    },
    configHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    configTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.secondary,
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
    newRecordButton: {
        backgroundColor: COLORS.secondary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        marginTop: 16,
        gap: 8,
    },
    newRecordButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
    editActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        marginTop: 16,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 6,
        gap: 4,
    },
    saveButton: {
        backgroundColor: COLORS.secondary,
    },
    cancelButton: {
        backgroundColor: COLORS.gray,
    },
    actionButtonText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '600',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    headerButton: {
        padding: 4,
    },
}); 