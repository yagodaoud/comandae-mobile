import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

interface CategoryCardProps {
    name: string;
    productTotal: number;
    image: string;
    onPress: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ name, productTotal, image, onPress }) => {
    return (
        <TouchableOpacity style={styles.categoryCard} onPress={onPress}>
            <View style={styles.categoryImageContainer}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.categoryImage} />
                ) : (
                    <View style={styles.categoryImagePlaceholder}>
                        <Feather name="image" size={24} color="#ccc" />
                    </View>
                )}
            </View>
            <Text style={styles.categoryName}>{name}</Text>
            <Text style={styles.categoryProducts}>{productTotal} produtos</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    categoryCard: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        alignItems: 'center',
    },
    categoryImageContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
        marginBottom: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    categoryImagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    categoryName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    categoryProducts: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
});

export default CategoryCard;
