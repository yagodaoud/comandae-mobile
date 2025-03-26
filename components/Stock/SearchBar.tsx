import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

interface SearchBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    activeView: 'products' | 'categories';
    onAddPress: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
    searchQuery,
    onSearchChange,
    activeView,
    onAddPress
}) => {
    return (
        <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
                <Feather name="search" size={18} color="#888" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder={activeView === 'products' ? "Buscar produtos" : "Buscar categorias"}
                    placeholderTextColor="#888"
                    value={searchQuery}
                    onChangeText={onSearchChange}
                />
            </View>
            <TouchableOpacity
                style={styles.addButton}
                onPress={onAddPress}
            >
                <Feather name="plus" size={20} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        alignItems: 'center',
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        paddingHorizontal: 12,
        marginRight: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 40,
        color: '#333',
    },
    addButton: {
        width: 40,
        height: 40,
        backgroundColor: COLORS.secondary,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default SearchBar;