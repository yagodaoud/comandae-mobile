import React from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TransparentHeader from '@/components/TransparentHeader';
import { COLORS } from '@/constants/theme';

import WelcomeHeader from './WelcomeHeader';
import InsightsCard from './InsightsCard';
import CategoriesSection from './CategoriesSection';

export default function Home() {
    const insets = useSafeAreaInsets();
    const bottomPadding = 60 + (Platform.OS === 'ios' ? insets.bottom : 0);

    return (
        <View style={styles.container}>
            <TransparentHeader title="Home" />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ paddingBottom: bottomPadding }}
                showsVerticalScrollIndicator={false}
            >
                <WelcomeHeader username="Yago" />
                <InsightsCard />
                <CategoriesSection />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
});