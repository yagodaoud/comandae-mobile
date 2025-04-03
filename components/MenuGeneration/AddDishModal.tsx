import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

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
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState('🍕');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [customEmoji, setCustomEmoji] = useState('');
    const [emojiInputError, setEmojiInputError] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);

    const createDish = useMutation(api.menu.createDish);
    const updateDish = useMutation(api.menu.updateDish);

    useEffect(() => {
        if (editDish && isEditing) {
            setName(editDish.name || '');
            setDescription(editDish.description || '');
            setPrice(typeof editDish.price === 'number'
                ? editDish.price.toFixed(2).replace('.', ',')
                : editDish.price || '');
            setSelectedEmoji(editDish.emoji || '🍕');
            setSelectedCategory(editDish.categoryId || null);
            setIsFavorite(editDish.isFavorite || false);
        } else {
            resetForm();
        }
    }, [editDish, isEditing, visible]);

    const resetForm = () => {
        setName('');
        setDescription('');
        setPrice('');
        setSelectedEmoji('🍕');
        setSelectedCategory(null);
        setCustomEmoji('');
        setEmojiInputError('');
        setIsFavorite(false);
    };

    const handleSubmit = async () => {
        if (!name || !price || !selectedCategory) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        setIsSubmitting(true);
        try {
            const priceNumber = parseFloat(price.toString().replace(',', '.'));
            if (isNaN(priceNumber)) {
                throw new Error('Preço inválido');
            }

            const dishData = {
                name,
                description,
                price: priceNumber,
                emoji: selectedEmoji,
                isFavorite: isFavorite,
                categoryId: selectedCategory,
            };

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

    const isEmoji = (str: string) => {
        const regex = /\p{Emoji}/u;
        return regex.test(str);
    };

    const handleEmojiChange = (text: string) => {
        if (text === '') {
            setCustomEmoji(text);
            setEmojiInputError('');
            return;
        }

        const lastChar = text.slice(-1);
        if (isEmoji(lastChar)) {
            setSelectedEmoji(lastChar);
            setCustomEmoji('');
            setEmojiInputError('');
        } else {
            setEmojiInputError('Por favor, insira apenas um emoji');
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
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            {isEditing ? 'Editar Prato' : 'Adicionar Novo Prato'}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Feather name="x" size={24} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Nome do Prato*</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Ex: Filé Mignon"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Descrição</Text>
                        <TextInput
                            style={[styles.input, styles.multilineInput]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Ex: Filé grelhado ao ponto com molho madeira"
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Preço*</Text>
                        <TextInput
                            style={styles.input}
                            value={price.toString()}
                            onChangeText={setPrice}
                            placeholder="Ex: 58,90"
                            keyboardType="decimal-pad"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Categoria*</Text>
                        <View style={styles.categoryContainer}>
                            {categories.map(category => (
                                <TouchableOpacity
                                    key={category._id}
                                    style={[
                                        styles.categoryButton,
                                        selectedCategory === category._id && styles.selectedCategory
                                    ]}
                                    onPress={() => setSelectedCategory(category._id)}
                                >
                                    <Text style={[
                                        styles.categoryText,
                                        selectedCategory === category._id && styles.selectedCategoryText
                                    ]}>
                                        {category.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Emoji</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiContainer}>
                            {emojiOptions.map(emoji => (
                                <TouchableOpacity
                                    key={emoji}
                                    style={[
                                        styles.emojiButton,
                                        selectedEmoji === emoji && styles.selectedEmoji
                                    ]}
                                    onPress={() => setSelectedEmoji(emoji)}
                                >
                                    <Text style={styles.emojiText}>{emoji}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={styles.formGroup}>
                        <TouchableOpacity
                            style={styles.favoriteToggle}
                            onPress={() => setIsFavorite(!isFavorite)}
                        >
                            <View style={[
                                styles.checkboxContainer,
                                isFavorite && styles.checkboxSelected
                            ]}>
                                {isFavorite && (
                                    <Feather name="check" size={16} color="#fff" />
                                )}
                            </View>
                            <Text style={styles.favoriteText}>
                                Marcar como favorito
                            </Text>
                            {isFavorite && (
                                <Feather name="star" size={20} color="#FFD700" style={styles.starIcon} />
                            )}
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.submitButtonText}>
                            {isSubmitting
                                ? (isEditing ? 'Atualizando...' : 'Adicionando...')
                                : (isEditing ? 'Atualizar Prato' : 'Adicionar Prato')
                            }
                        </Text>
                    </TouchableOpacity>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#555',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    multilineInput: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryButton: {
        backgroundColor: '#fff',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    categoryText: {
        fontSize: 14,
    },
    selectedCategoryText: {
        color: '#fff',
    },
    selectedCategory: {
        backgroundColor: COLORS.secondary,
        borderColor: COLORS.white,
    },
    emojiContainer: {
        flexDirection: 'row',
        marginTop: 8,
    },
    emojiButton: {
        padding: 12,
        borderRadius: 8,
        marginRight: 8,
        backgroundColor: '#f0f0f0',
    },
    selectedEmoji: {
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.secondary,
    },
    emojiText: {
        fontSize: 24,
    },
    selectedEmojiContainer: {
        alignItems: 'center',
        marginBottom: 12,
    },
    favoriteToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    checkboxContainer: {
        width: 24,
        height: 24,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    checkboxSelected: {
        backgroundColor: COLORS.secondary,
        borderColor: COLORS.secondary,
    },
    favoriteText: {
        fontSize: 16,
        color: '#555',
    },
    starIcon: {
        marginLeft: 8,
    },
    submitButton: {
        backgroundColor: COLORS.secondary,
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 16,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    inputError: {
        borderColor: COLORS.error,
    },
    errorText: {
        color: COLORS.error,
        fontSize: 12,
        marginTop: 4,
    },
});