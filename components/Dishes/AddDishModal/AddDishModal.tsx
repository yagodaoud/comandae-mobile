import React, { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

import { FormField } from './FormField';
import { EmojiSelector } from './EmojiSelector';
import { CategorySelector } from './CategorySelector';
import { Checkbox } from './Checkbox';
import { Button } from './Button';
import { ModalHeader } from './ModalHeader';
import { useDishForm } from './useDishForm';

const emojiOptions = ['🍚', '🥘', '🥩', '🍖', '🐓', '🐟', '🥦', '🌽', '🥔', '🍟', '🍌', '🍝', '🍳', '😋', '🍆', '🥕', '🧀', '🥬', '🍅', '🥗', '🥭', '🍍', '🍠'];

interface Category {
    _id: string;
    name: string;
}

interface DishData {
    id?: string;
    name: string;
    description: string;
    price: string | number;
    emoji: string;
    categoryId?: string;
    isFavorite?: boolean;
}

interface AddDishModalProps {
    visible: boolean;
    categories: Category[];
    onClose: () => void;
    onDishAdded: () => void;
    onDishUpdated?: () => void;
    editDish?: DishData | null;
    isEditing?: boolean;
}

export default function AddDishModal({
    visible,
    categories,
    onClose,
    onDishAdded,
    onDishUpdated,
    editDish = null,
    isEditing = false
}: AddDishModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const createDish = useMutation(api.menu.createDish);
    const updateDish = useMutation(api.menu.updateDish);

    const {
        name, setName,
        description, setDescription,
        price, setPrice,
        selectedEmoji, setSelectedEmoji,
        selectedCategory, setSelectedCategory,
        isFavorite, setIsFavorite,
        errors, resetForm, validate, getFormData
    } = useDishForm(isEditing ? editDish : null);

    useEffect(() => {
        if (visible) {
            if (isEditing && editDish) {
            } else {
                resetForm();
            }
        }
    }, [visible, isEditing, editDish]);

    const handleSubmit = async () => {
        if (!validate()) {
            return;
        }

        setIsSubmitting(true);
        try {
            const dishData = getFormData();

            if (isEditing && editDish?.id) {
                await updateDish({
                    id: editDish.id,
                    ...dishData
                });

                if (onDishUpdated) onDishUpdated();
            } else {
                await createDish(dishData);
                onDishAdded();
            }

            onClose();
            resetForm();
        } catch (error: any) {
            console.error(`Error ${isEditing ? 'updating' : 'creating'} dish:`, error);
            alert(`Erro ao ${isEditing ? 'atualizar' : 'adicionar'} prato: ` + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <ModalHeader
                        title={isEditing ? 'Editar Prato' : 'Adicionar Novo Prato'}
                        onClose={onClose}
                    />

                    <FormField
                        label="Nome do Prato"
                        value={name}
                        onChangeText={setName}
                        placeholder="Ex: Filé Mignon"
                        required
                        error={errors.name}
                    />

                    <FormField
                        label="Descrição"
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Ex: Filé grelhado ao ponto com molho madeira"
                        multiline
                        numberOfLines={3}
                    />

                    <FormField
                        label="Preço"
                        value={price.toString()}
                        onChangeText={setPrice}
                        placeholder="Ex: 58,90"
                        keyboardType="decimal-pad"
                        required
                        error={errors.price}
                    />

                    <CategorySelector
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onSelect={setSelectedCategory}
                    />
                    {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

                    <EmojiSelector
                        options={emojiOptions}
                        selectedEmoji={selectedEmoji}
                        onSelect={setSelectedEmoji}
                    />

                    <View style={styles.formGroup}>
                        <Checkbox
                            label="Marcar como favorito"
                            checked={isFavorite}
                            onToggle={() => setIsFavorite(!isFavorite)}
                            icon={isFavorite ? <Feather name="star" size={20} color="#FFD700" style={styles.starIcon} /> : undefined}
                        />
                    </View>

                    <Button
                        title={isEditing ? 'Atualizar Prato' : 'Adicionar Prato'}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                        loading={isSubmitting}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContainer: {
        padding: 16,
        paddingBottom: 32,
    },
    formGroup: {
        marginBottom: 20,
    },
    starIcon: {
        marginLeft: 8,
    },
    errorText: {
        color: COLORS.error,
        fontSize: 12,
        marginTop: -16,
        marginBottom: 16,
    },
});