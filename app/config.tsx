import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import TransparentHeader from '@/components/TransparentHeader';
import ConfigSection from '@/components/Config/ConfigSection';
import ConfigItem from '@/components/Config/ConfigItem';
import { COLORS } from '@/constants/theme';

export default function ConfigPage() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <TransparentHeader
                title="Configurações"
                backButton
                onBackPress={() => router.back()}
            />
            <ScrollView style={styles.content}>
                <ConfigSection
                    title="Geral"
                    items={[
                        { icon: 'bell', label: 'Notificações', onPress: () => { } },
                        { icon: 'globe', label: 'Idioma', onPress: () => { } },
                        { icon: 'moon', label: 'Tema', onPress: () => { } },
                        { icon: 'target', label: 'Meta Diária', onPress: () => router.push('/daily-goal-config') },
                    ]}
                />
                <ConfigSection
                    title="Perfil"
                    items={[
                        { icon: 'user', label: 'Informações Pessoais', onPress: () => { } },
                        { icon: 'lock', label: 'Segurança', onPress: () => { } },
                        { icon: 'shield', label: 'Privacidade', onPress: () => { } },
                    ]}
                />
                <ConfigSection
                    title="Pagamento"
                    items={[
                        { icon: 'credit-card', label: 'Métodos de Pagamento', onPress: () => router.push('/payment-methods') },
                        { icon: 'file-text', label: 'Histórico de Pagamentos', onPress: () => { } },
                        { icon: 'dollar-sign', label: 'Preferências de Pagamento', onPress: () => { } },
                    ]}
                />
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
}); 