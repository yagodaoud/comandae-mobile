import { useState, useEffect } from 'react';

interface DishData {
    id?: string;
    name: string;
    description: string;
    price: string | number;
    emoji: string;
    categoryId?: string;
    isFavorite?: boolean;
}

export const useDishForm = (initialDish: DishData | null = null) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState('🍕');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (initialDish) {
            setName(initialDish.name || '');
            setDescription(initialDish.description || '');
            setPrice(typeof initialDish.price === 'number'
                ? initialDish.price.toFixed(2).replace('.', ',')
                : initialDish.price?.toString() || '');
            setSelectedEmoji(initialDish.emoji || '🍕');
            setSelectedCategory(initialDish.categoryId || null);
            setIsFavorite(initialDish.isFavorite || false);
        } else {
            resetForm();
        }
    }, [initialDish]);

    const resetForm = () => {
        setName('');
        setDescription('');
        setPrice('');
        setSelectedEmoji('🍕');
        setSelectedCategory(null);
        setIsFavorite(false);
        setErrors({});
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};

        if (!name.trim()) {
            newErrors.name = 'Nome é obrigatório';
        }

        if (!price) {
            newErrors.price = 'Preço é obrigatório';
        } else {
            const priceValue = parseFloat(price.toString().replace(',', '.'));
            if (isNaN(priceValue)) {
                newErrors.price = 'Preço inválido';
            }
        }

        if (!selectedCategory) {
            newErrors.category = 'Selecione uma categoria';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const getFormData = () => {
        const priceNumber = parseFloat(price.toString().replace(',', '.'));

        return {
            name,
            description,
            price: priceNumber,
            emoji: selectedEmoji,
            categoryId: selectedCategory,
            isFavorite,
        };
    };

    return {
        name,
        setName,
        description,
        setDescription,
        price,
        setPrice,
        selectedEmoji,
        setSelectedEmoji,
        selectedCategory,
        setSelectedCategory,
        isFavorite,
        setIsFavorite,
        errors,
        resetForm,
        validate,
        getFormData
    };
};