import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import TransparentHeader from '@/components/TransparentHeader';
import { COLORS } from '@/constants/theme';
import ConfigItem from '@/components/Config/ConfigItem'; // Assuming a reusable item component
import { Feather } from '@expo/vector-icons';

export default function PaymentMethodsPage() {
    const router = useRouter();

    const paymentMethods = [
        { label: 'Pix', route: '/pix-config' },
        { label: 'Bitcoin', route: '/bitcoin-config' },
        { label: 'Cartão', route: null }, // No specific config page for now
        { label: 'Dinheiro', route: null }, // No specific config page for now
    ];

    return (
        <View style={styles.container}>
            <TransparentHeader
                title="Métodos de Pagamento"
                backButton
                onBackPress={() => router.back()}
                icon={null}
            />
            <ScrollView style={styles.content}>
                <View style={styles.sectionContainer}>
                    {paymentMethods.map((method, index) => (
                        <ConfigItem // Using the ConfigItem structure for consistency
                            key={index}
                            label={method.label}
                            onPress={() => method.route ? router.push(method.route as any) : null}
                            showChevron={!!method.route}
                        />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    sectionContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        overflow: 'hidden',
    },
}); 