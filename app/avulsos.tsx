import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import TransparentHeader from '@/components/TransparentHeader';
import { SearchBar } from '@/components/SearchBar';
import { EmptyState } from '@/components/EmptyState';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { formatBRL } from '@/utils/formatBRL';
import AddAvulsoModal from '@/components/Avulsos/AddAvulsoModal';
import { Id } from '@/convex/_generated/dataModel';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

type Avulso = {
    _id: Id<'avulsos'>;
    description: string;
    total: number;
    products?: Array<{
        productId: Id<'products'>;
        quantity: number;
        price: number;
    }>;
    extraAmount?: number;
    createdAt: number;
};

export default function Avulsos() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [editAvulso, setEditAvulso] = useState<Avulso | null>(null);

    const dateString = selectedDate.toISOString().slice(0, 10);
    const avulsos = useQuery(api.avulsos.getAvulsos, {
        searchQuery: searchQuery || undefined,
        date: dateString,
    });

    const products = useQuery(api.products.getProducts) ?? [];
    const deleteAvulso = useMutation(api.avulsos.deleteAvulso);

    const handleModalClose = () => {
        setIsAddModalVisible(false);
    };

    const formatTime = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);

        if (hours > 0) {
            return `${hours}h atrás`;
        } else if (minutes > 0) {
            return `${minutes}min atrás`;
        } else {
            return 'Agora';
        }
    };

    const formattedDate = `${selectedDate.getDate().toString().padStart(2, '0')}/${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}/${selectedDate.getFullYear()}`;

    if (!avulsos) {
        return <LoadingOverlay />;
    }

    const handleDeleteAvulso = (id: Id<'avulsos'>) => {
        Alert.alert(
            'Excluir Avulso',
            'Tem certeza que deseja excluir este avulso?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir', style: 'destructive', onPress: async () => {
                        try {
                            await deleteAvulso({ _id: id });
                        } catch (e) {
                            alert('Erro ao excluir avulso');
                        }
                    }
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <TransparentHeader
                title="Avulsos"
                backButton={true}
                onBackPress={() => router.back()}
                icon={null}
            />

            <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                rightIcon={<Feather name="plus" size={20} color="#fff" />}
                onRightIconPress={() => setIsAddModalVisible(true)}
            />

            <View style={styles.datePickerContainer}>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                    <Text style={styles.dateButtonText}>
                        {selectedDate.toLocaleDateString()}
                    </Text>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display="default"
                        onChange={(event, date) => {
                            setShowDatePicker(false);
                            if (date) setSelectedDate(date);
                        }}
                    />
                )}
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollViewContent,
                    { paddingBottom: insets.bottom + 20 }
                ]}
            >
                {avulsos.length === 0 ? (
                    <EmptyState message="Nenhum avulso encontrado." />
                ) : (
                    avulsos.map((avulso) => {
                        const cardContent = (
                            <View style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.time}>{new Date(avulso.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                    <TouchableOpacity onPress={() => handleDeleteAvulso(avulso._id)} style={styles.deleteButton}>
                                        <Feather name="trash-2" size={20} color="#F44336" />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.description}>{avulso.description || <Text style={{ color: '#aaa' }}>Sem descrição</Text>}</Text>
                                {avulso.products && avulso.products.length > 0 && (
                                    <View style={styles.productsList}>
                                        {avulso.products.slice(0, 3).map((item, idx) => {
                                            const product = products.find(p => p._id === item.productId);
                                            return (
                                                <Text key={idx} style={styles.productLine}>
                                                    {product?.name || 'Produto'} x{item.quantity} - {formatBRL(item.price)}
                                                </Text>
                                            );
                                        })}
                                        {avulso.products.length > 3 && (
                                            <Text style={styles.moreProducts}>+{avulso.products.length - 3} outros</Text>
                                        )}
                                    </View>
                                )}
                                <View style={styles.cardFooter}>
                                    <View style={{ flex: 1 }} />
                                    <Text style={styles.total}>{formatBRL(avulso.total)}</Text>
                                </View>
                            </View>
                        );
                        return (
                            <TouchableOpacity key={avulso._id} activeOpacity={0.8} onPress={() => setEditAvulso(avulso)}>
                                {cardContent}
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>

            <AddAvulsoModal
                visible={isAddModalVisible || !!editAvulso}
                onClose={() => { setIsAddModalVisible(false); setEditAvulso(null); }}
                avulso={editAvulso}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    datePickerContainer: {
        marginVertical: 8,
        alignItems: 'center',
    },
    dateButton: {
        padding: 8,
        backgroundColor: COLORS.secondary,
        borderRadius: 8,
    },
    dateButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    avulsoCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    avulsoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1,
        marginRight: 12,
    },
    total: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    productsSection: {
        marginBottom: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    productsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    productItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    productName: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    productDetails: {
        fontSize: 14,
        color: '#666',
    },
    extraSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    extraLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    extraAmount: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.secondary,
    },
    avulsoFooter: {
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    time: {
        fontSize: 12,
        color: '#999',
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    deleteButton: {
        padding: 4,
    },
    description: {
        fontSize: 16,
        color: '#333',
        marginBottom: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    total: {
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: 'bold',
        alignSelf: 'flex-end',
    },
    productsList: {
        marginBottom: 8,
    },
    productLine: {
        fontSize: 14,
        color: '#555',
    },
    moreProducts: {
        fontSize: 13,
        color: '#aaa',
    },
}); 