import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TransparentHeader from '@/components/TransparentHeader';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

const CategoryCard = ({ icon, title, count, subtitle, actionText }) => {
    return (
        <View style={styles.categoryCard}>
            <View style={styles.categoryTop}>
                <View style={styles.categoryIconContainer}>
                    {icon}
                </View>
                <View style={styles.avatarGroup}>
                    <Image
                        source={require('@/assets/images/avatar-placeholder.png')}
                        style={[styles.avatar, { right: 0 }]}
                    />
                    <Image
                        source={require('@/assets/images/avatar-placeholder.png')}
                        style={[styles.avatar, { right: 10 }]}
                    />
                </View>
            </View>
            <Text style={styles.categoryCount}>{count}</Text>
            <Text style={styles.categoryTitle}>{title}</Text>
            <Text style={styles.categorySubtitle}>{subtitle}</Text>
            <View style={styles.categoryBottom}>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '30%' }]} />
                </View>
                <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionText}>{actionText}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default function Home() {
    const insets = useSafeAreaInsets();

    // Calculate bottom padding to account for tab bar height (60) plus any additional safe area
    const bottomPadding = 60 + (Platform.OS === 'ios' ? insets.bottom : 0);

    return (
        <View style={styles.container}>
            <TransparentHeader />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ paddingBottom: bottomPadding }}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.welcomeTitle}>Welcome to Comandae</Text>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>Insights</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.insightCard}>
                    <View style={styles.insightHeader}>
                        <View>
                            <Text style={styles.insightTitle}>Daily Insights</Text>
                            <Text style={styles.insightSubtitle}>Track your daily operations here</Text>
                        </View>
                        <Image
                            source={require('@/assets/images/avatar-placeholder.png')}
                            style={styles.insightImage}
                        />
                    </View>

                    <Text style={styles.percentageText}>76%</Text>
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBackground}>
                            <View style={[styles.progressFill, { width: '76%' }]} />
                        </View>
                    </View>
                </View>

                <View style={styles.categoriesSection}>
                    <View style={styles.categoriesHeader}>
                        <Text style={styles.categoriesTitle}>Categories</Text>
                        <TouchableOpacity style={styles.upgradePill}>
                            <Text style={styles.upgradeText}>UPGRADE PLAN</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.categoryGrid}>
                        <CategoryCard
                            icon={<Feather name="book" size={24} color={COLORS.primary} />}
                            count="5 New Menu"
                            title="Manage"
                            subtitle=""
                            actionText="See All"
                        />
                        <CategoryCard
                            icon={<Feather name="shopping-bag" size={24} color={COLORS.primary} />}
                            count="2 New Orders"
                            title="Manage"
                            subtitle=""
                            actionText="Process"
                        />
                    </View>

                    <View style={styles.categoryGrid}>
                        <CategoryCard
                            icon={<Feather name="check-square" size={24} color={COLORS.primary} />}
                            count="9 New Orders"
                            title="Manage"
                            subtitle=""
                            actionText="Track"
                        />
                        <CategoryCard
                            icon={<Feather name="alert-triangle" size={24} color={COLORS.primary} />}
                            count="5 Low Stock"
                            title="Urgent Items"
                            subtitle=""
                            actionText="View"
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    button: {
        backgroundColor: '#E79C4F',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginRight: 12,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
    },
    insightCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    insightHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    insightTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    insightSubtitle: {
        fontSize: 14,
        color: '#888',
    },
    insightImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    percentageText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    progressContainer: {
        marginBottom: 8,
    },
    progressBackground: {
        height: 8,
        backgroundColor: '#eee',
        borderRadius: 4,
    },
    progressFill: {
        height: 8,
        backgroundColor: COLORS.primary,
        borderRadius: 4,
    },
    categoriesSection: {
        marginBottom: 24,
    },
    categoriesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    categoriesTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    upgradePill: {
        backgroundColor: '#333',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    upgradeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    categoryGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    categoryCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        width: '48%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    categoryTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    categoryIconContainer: {
        backgroundColor: '#f7f7f7',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarGroup: {
        flexDirection: 'row',
        position: 'relative',
        width: 40,
        height: 24,
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        position: 'absolute',
        borderWidth: 1,
        borderColor: '#fff',
    },
    categoryCount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    categoryTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 4,
    },
    categorySubtitle: {
        fontSize: 12,
        color: '#888',
        marginBottom: 12,
    },
    categoryBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressBar: {
        height: 4,
        backgroundColor: '#eee',
        borderRadius: 2,
        width: '40%',
    },
    actionButton: {
        backgroundColor: '#f7f7f7',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    actionText: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '600',
    },
});