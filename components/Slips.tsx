import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import TransparentHeader from '@/components/TransparentHeader';

const initialComandas = [
    { id: '1', table: 'Mesa 1', items: 4, total: '124,90', time: '15min', status: 'recent' },
    { id: '2', table: 'Mesa 3', items: 6, total: '198,50', time: '42min', status: 'medium' },
    { id: '3', table: 'Mesa 7', items: 8, total: '345,20', time: '1h 12min', status: 'long' },
    { id: '4', table: 'Mesa 9', items: 2, total: '64,80', time: '7min', status: 'recent' },
    { id: '5', table: 'Mesa 12', items: 5, total: '212,30', time: '50min', status: 'medium' },
    { id: '6', table: 'Mesa 15', items: 3, total: '98,90', time: '22min', status: 'medium' },
    { id: '7', table: 'Mesa 18', items: 7, total: '276,40', time: '1h 35min', status: 'long' },
    { id: '8', table: 'Mesa 20', items: 4, total: '142,30', time: '5min', status: 'recent' },
];

const ComandaCard = ({ table, items, total, time, status, onPress }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'recent': return '#4CAF50';
            case 'medium': return '#FF9800';
            case 'long': return '#F44336';
            default: return '#4CAF50';
        }
    };

    return (
        <TouchableOpacity
            style={[styles.comandaCard, { borderLeftColor: getStatusColor(status) }]}
            onPress={onPress}
        >
            <View style={styles.comandaHeader}>
                <Text style={styles.comandaTitle}>{table}</Text>
                <View style={[styles.timeIndicator, { backgroundColor: getStatusColor(status) }]}>
                    <Text style={styles.timeText}>{time}</Text>
                </View>
            </View>
            <View style={styles.comandaContent}>
                <View style={styles.commandDetail}>
                    <Feather name="shopping-bag" size={16} color="#888" />
                    <Text style={styles.commandDetailText}>{items} itens</Text>
                </View>
                <View style={styles.comandaDivider} />
                <View style={styles.commandDetail}>
                    <Feather name="dollar-sign" size={16} color="#888" />
                    <Text style={styles.commandDetailText}>R$ {total}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default function Slips() {
    const insets = useSafeAreaInsets();
    const [comandas, setComandas] = useState(initialComandas);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');

    const bottomPadding = 60 + (Platform.OS === 'ios' ? insets.bottom : 0);

    const filteredComandas = comandas.filter(comanda => {
        const matchesSearch = comanda.table.toLowerCase().includes(searchQuery.toLowerCase());
        if (activeFilter === 'all') return matchesSearch;
        return matchesSearch && comanda.status === activeFilter;
    });

    const stats = {
        total: comandas.length,
        totalValue: comandas.reduce((sum, comanda) =>
            sum + parseFloat(comanda.total.replace(',', '.')), 0).toFixed(2).replace('.', ','),
        recent: comandas.filter(c => c.status === 'recent').length,
        medium: comandas.filter(c => c.status === 'medium').length,
        long: comandas.filter(c => c.status === 'long').length,
    };

    return (
        <View style={styles.container}>
            <TransparentHeader title="Comandas" />

            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <Feather name="search" size={18} color="#888" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar por mesa"
                        placeholderTextColor="#888"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => console.log('Add new comanda')}
                >
                    <Feather name="plus" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.statsCard}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.total}</Text>
                    <Text style={styles.statLabel}>Comandas</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.long}</Text>
                    <Text style={styles.statLabel}>Aguardando</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>R$ {stats.totalValue}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </View>
            </View>

            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterChip, activeFilter === 'all' && styles.activeFilterChip]}
                    onPress={() => setActiveFilter('all')}
                >
                    <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>
                        Todos
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.filterChip, activeFilter === 'recent' && styles.activeFilterChip]}
                    onPress={() => setActiveFilter('recent')}
                >
                    <View style={[styles.colorIndicator, { backgroundColor: '#4CAF50' }]} />
                    <Text style={[styles.filterText, activeFilter === 'recent' && styles.activeFilterText]}>
                        Recentes
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.filterChip, activeFilter === 'medium' && styles.activeFilterChip]}
                    onPress={() => setActiveFilter('medium')}
                >
                    <View style={[styles.colorIndicator, { backgroundColor: '#FF9800' }]} />
                    <Text style={[styles.filterText, activeFilter === 'medium' && styles.activeFilterText]}>
                        Em Espera
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.filterChip, activeFilter === 'long' && styles.activeFilterChip]}
                    onPress={() => setActiveFilter('long')}
                >
                    <View style={[styles.colorIndicator, { backgroundColor: '#F44336' }]} />
                    <Text style={[styles.filterText, activeFilter === 'long' && styles.activeFilterText]}>
                        Atrasados
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{
                    paddingBottom: bottomPadding,
                    paddingHorizontal: 16
                }}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.comandasGrid}>
                    {filteredComandas.map(comanda => (
                        <ComandaCard
                            key={comanda.id}
                            table={comanda.table}
                            items={comanda.items}
                            total={comanda.total}
                            time={comanda.time}
                            status={comanda.status}
                            onPress={() => console.log('View comanda', comanda.id)}
                        />
                    ))}
                </View>

                {filteredComandas.length === 0 && (
                    <View style={styles.emptyState}>
                        <Feather name="clipboard" size={48} color="#ccc" />
                        <Text style={styles.emptyStateText}>Nenhuma comanda encontrada</Text>
                    </View>
                )}
            </ScrollView>

            <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => console.log('Quick add new comanda')}
            >
                <Feather name="plus" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
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
    statsCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
        borderRadius: 12,
        paddingVertical: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    statLabel: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: '70%',
        backgroundColor: '#e0e0e0',
        alignSelf: 'center',
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 8,
        overflow: 'scroll',
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginRight: 8,
        borderRadius: 16,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    activeFilterChip: {
        backgroundColor: COLORS.secondary,
        borderColor: COLORS.secondary,
    },
    colorIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    filterText: {
        fontSize: 12,
        color: '#333',
    },
    activeFilterText: {
        color: '#fff',
        fontWeight: '500',
    },
    scrollView: {
        flex: 1,
    },
    comandasGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingTop: 8,
    },
    comandaCard: {
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
        borderLeftWidth: 4,
    },
    comandaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    comandaTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    timeIndicator: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    timeText: {
        fontSize: 10,
        fontWeight: '500',
        color: '#fff',
    },
    comandaContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    commandDetail: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    commandDetailText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    comandaDivider: {
        width: 1,
        height: 16,
        backgroundColor: '#e0e0e0',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 64,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#888',
        marginTop: 16,
    },
    quickActionButton: {
        position: 'absolute',
        right: 16,
        bottom: 80,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
});