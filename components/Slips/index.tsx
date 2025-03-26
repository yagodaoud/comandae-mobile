import React, { useState } from 'react';
import { View, ScrollView, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import TransparentHeader from '@/components/TransparentHeader';
import { ComandaCard } from './ComandaCard';
import { SearchBar } from './SearchBar';
import { StatsCard } from './StatsCard';
import { FilterChips } from './FilterChips';
import { EmptyState } from './EmptyState';
import { QuickActionButton } from './QuickActionButton';

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
        long: comandas.filter(c => c.status === 'long').length,
    };

    return (
        <View style={styles.container}>
            <TransparentHeader title="Comandas" />

            <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddPress={() => console.log('Add new comanda')}
            />

            <StatsCard
                total={stats.total}
                totalValue={stats.totalValue}
                longCount={stats.long}
            />

            <FilterChips
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
            />

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
                    <EmptyState
                        icon={<Feather name="clipboard" size={48} color="#ccc" />}
                        message="Nenhuma comanda encontrada"
                    />
                )}
            </ScrollView>

            <QuickActionButton
                onPress={() => console.log('Quick add new comanda')}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    comandasGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingTop: 8,
    },
    scrollView: {
        flex: 1,
    },

});