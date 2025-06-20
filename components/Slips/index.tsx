import React, { useState, useEffect } from 'react';
import { View, ScrollView, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import TransparentHeader from '@/components/TransparentHeader';
import { ComandaCard } from './ComandaCard';
import { SearchBar } from '@/components/SearchBar';
import { StatsCard } from './StatsCard';
import { EmptyState } from './EmptyState';
import { QuickActionButton } from './QuickActionButton';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import AddSlipModal from './AddSlipModal';
import { Id } from '@/convex/_generated/dataModel';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';

export default function Slips() {
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [editingSlip, setEditingSlip] = useState<{ id: Id<"slips">; table: string } | null>(null);

    const bottomPadding = 60 + (Platform.OS === 'ios' ? insets.bottom : 0);

    const slips = useQuery(api.slips.getSlips, {
        isOpen: true,
        searchQuery: searchQuery || undefined,
    });

    const updateSlipStatus = useMutation(api.slips.updateSlipStatus);

    useEffect(() => {
        if (!slips?.length) return;

        const updateStatuses = async () => {
            for (const slip of slips) {
                if (slip.isOpen) {
                    const timeDiff = Date.now() - slip.lastUpdateTime;
                    let newStatus = slip.status;

                    if (timeDiff > 3600000) {
                        newStatus = "long";
                    } else if (timeDiff > 1800000) {
                        newStatus = "medium";
                    } else {
                        newStatus = "recent";
                    }

                    if (newStatus !== slip.status) {
                        const currentSlip = slips.find(s => s._id === slip._id);
                        if (currentSlip) {
                            await updateSlipStatus({ id: slip._id, status: newStatus });
                        }
                    }
                }
            }
        };

        const interval = setInterval(updateStatuses, 60000);
        return () => clearInterval(interval);
    }, [slips, updateSlipStatus]);

    const stats = {
        total: slips?.length ?? 0,
        totalValue: (slips?.reduce((sum, slip) => sum + slip.total, 0) ?? 0).toFixed(2).replace('.', ','),
        long: slips?.filter(s => s.status === 'long' && s.isOpen).length ?? 0,
    };

    const handleSlipPress = (slip: NonNullable<typeof slips>[0]) => {
        setEditingSlip({
            id: slip._id,
            table: slip.table,
        });
        setIsAddModalVisible(true);
    };

    const handleModalClose = () => {
        setIsAddModalVisible(false);
        setEditingSlip(null);
    };

    return (
        <View style={styles.container}>
            <TransparentHeader title="Comandas" />

            <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddPress={() => setIsAddModalVisible(true)}
            />

            <StatsCard
                total={stats.total}
                totalValue={stats.totalValue}
                longCount={stats.long}
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
                    {slips?.map(slip => (
                        slip.isOpen && (
                            <ComandaCard
                                key={slip._id}
                                id={slip._id}
                                table={slip.table}
                                items={slip.items.length}
                                total={slip.total.toFixed(2).replace('.', ',')}
                                time={slip.time}
                                status={slip.status}
                                onPress={() => handleSlipPress(slip)}
                            />
                        )
                    ))}
                </View>

                {slips === undefined ? (
                    <LoadingOverlay
                        size="small"
                        backgroundColor={COLORS.white}
                        overlayOpacity={0.7}
                    />
                ) : (
                    <>
                        {slips.filter(slip => slip.isOpen).length === 0 && searchQuery === '' && (
                            <EmptyState
                                icon={<Feather name="clipboard" size={48} color="#ccc" />}
                                message="Nenhuma comanda aberta encontrada"
                            />
                        )}

                        {slips.filter(slip => slip.isOpen).length === 0 && searchQuery !== '' && (
                            <EmptyState
                                icon={<Feather name="search" size={48} color="#ccc" />}
                                message="Nenhuma comanda encontrada para a sua busca"
                            />
                        )}
                    </>
                )}
            </ScrollView>

            <QuickActionButton
                onPress={() => setIsAddModalVisible(true)}
            />

            <AddSlipModal
                visible={isAddModalVisible}
                onClose={handleModalClose}
                onSlipAdded={handleModalClose}
                editingSlip={editingSlip}
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