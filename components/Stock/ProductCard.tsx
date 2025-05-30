import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

interface ProductCardProps {
    name: string;
    category: string;
    price: string;
    stock: number;
    hasInfiniteStock: boolean;
    image: string;
    onPress: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ name, category, price, stock, hasInfiniteStock, image, onPress }) => {
    const lowStock = hasInfiniteStock === false && stock < 10;

    return (
        <TouchableOpacity style={styles.productCard} onPress={onPress}>
            <View style={styles.productHeader}>
                <View style={styles.productImageContainer}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.productImage} />
                    ) : (
                        <View style={styles.productImagePlaceholder}>
                            <Feather name="image" size={24} color="#ccc" />
                        </View>
                    )}
                </View>
                <View style={styles.productInfo}>
                    <Text style={styles.productName}>{name}</Text>
                    <Text style={styles.productCategory}>{category}</Text>
                </View>
            </View>
            <View style={styles.productFooter}>
                <Text style={styles.productPrice}>R$ {price}</Text>
                <View
                    style={[styles.stockIndicator, { backgroundColor: lowStock ? '#F44336' : '#4CAF50' }]}
                >
                    <Text style={styles.stockText}>{stock} un</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    productCard: {
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
    },
    productHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    productImageContainer: {
        width: 50,
        height: 50,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    productImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    productImagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    productCategory: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    productFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    productPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    stockIndicator: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    stockText: {
        fontSize: 10,
        fontWeight: '500',
        color: '#fff',
    },
});

export default ProductCard;
