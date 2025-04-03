import React from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

interface SearchBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onAddItem: () => void;
    onScanMenu: () => void;
    isSearching?: boolean;
}

export const SearchBar = ({
    searchQuery,
    onSearchChange,
    onAddItem,
    onScanMenu,
    isSearching = false
}: SearchBarProps) => {
    return (
        <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
                {isSearching ? (
                    <ActivityIndicator size="small" color={COLORS.primary} style={styles.searchIcon} />
                ) : (
                    <Feather name="search" size={18} color="#888" style={styles.searchIcon} />
                )}
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar item no cardápio"
                    placeholderTextColor="#888"
                    value={searchQuery}
                    onChangeText={onSearchChange}
                />
            </View>
            <TouchableOpacity style={styles.iconButton} onPress={onAddItem}>
                <Feather name="plus" size={24} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.scanButton}
                onPress={onScanMenu}
            >
                <Feather name="camera" size={20} color={COLORS.white} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    iconButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        marginRight: 8,
    },
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        paddingHorizontal: 12,
        marginRight: 8,
    },
    searchIcon: {
        marginRight: 8,
        width: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchInput: {
        flex: 1,
        height: 40,
        color: '#333',
    },
    scanButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.secondary,
        borderRadius: 8,
    },
});