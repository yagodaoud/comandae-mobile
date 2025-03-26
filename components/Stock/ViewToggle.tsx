import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

interface ViewToggleProps {
    activeView: 'products' | 'categories';
    onToggleView: (view: 'products' | 'categories') => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({
    activeView,
    onToggleView
}) => {
    return (
        <View style={styles.viewToggleContainer}>
            <TouchableOpacity
                style={[
                    styles.viewToggleButton,
                    activeView === 'products' && styles.activeViewToggle
                ]}
                onPress={() => onToggleView('products')}
            >
                <Feather
                    name="box"
                    size={16}
                    color={activeView === 'products' ? '#fff' : '#666'}
                />
                <Text style={[
                    styles.viewToggleText,
                    activeView === 'products' && styles.activeViewToggleText
                ]}>
                    Produtos
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[
                    styles.viewToggleButton,
                    activeView === 'categories' && styles.activeViewToggle
                ]}
                onPress={() => onToggleView('categories')}
            >
                <Feather
                    name="tag"
                    size={16}
                    color={activeView === 'categories' ? '#fff' : '#666'}
                />
                <Text style={[
                    styles.viewToggleText,
                    activeView === 'categories' && styles.activeViewToggleText
                ]}>
                    Categorias
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    viewToggleContainer: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 4,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
    },
    viewToggleButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        backgroundColor: '#f0f0f0',
    },
    activeViewToggle: {
        backgroundColor: COLORS.secondary,
    },
    viewToggleText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#666',
    },
    activeViewToggleText: {
        color: '#fff',
        fontWeight: '500',
    },
});

export default ViewToggle;