import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/theme';

export default function TabLayout() {
    const insets = useSafeAreaInsets();

    const bottomPadding = Platform.OS === 'ios' ? Math.max(insets.bottom, 10) : 10;

    return (
        <Tabs
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: COLORS.white,
                tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
                tabBarShowLabel: true,
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                    marginBottom: Platform.OS === 'ios' ? 0 : 5,
                },
                tabBarStyle: {
                    backgroundColor: COLORS.secondary,
                    borderTopWidth: 0,
                    position: 'absolute',
                    elevation: 0,
                    height: 60 + (Platform.OS === 'ios' ? insets.bottom : 0),
                    paddingBottom: bottomPadding,
                    paddingTop: 5,
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: -3,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 6,
                },
                tabBarItemStyle: {
                    paddingVertical: 5,
                    marginTop: -5,
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'index') {
                        return (
                            <TabBarIcon>
                                <Feather name="home" size={size} color={color} />
                                {focused && <View style={styles.activeIndicator} />}
                            </TabBarIcon>
                        );
                    } else if (route.name === 'stock') {
                        return (
                            <TabBarIcon>
                                <Feather name="box" size={size} color={color} />
                                {focused && <View style={styles.activeIndicator} />}
                            </TabBarIcon>
                        );
                    } else if (route.name === 'slips') {
                        return (
                            <TabBarIcon>
                                <Feather name="check-square" size={size} color={color} />
                                {focused && <View style={styles.activeIndicator} />}
                            </TabBarIcon>
                        );
                    } else if (route.name === 'dishes') {
                        return (
                            <TabBarIcon>
                                <MaterialCommunityIcons name="silverware-fork-knife" size={size} color={color} />
                                {focused && <View style={styles.activeIndicator} />}
                            </TabBarIcon>
                        );
                    } else if (route.name === 'payment') {
                        return (
                            <TabBarIcon>
                                <Feather name="credit-card" size={size} color={color} />
                                {focused && <View style={styles.activeIndicator} />}
                            </TabBarIcon>
                        );
                    }
                },
            })}
        >
            <Tabs.Screen
                name='index'
                options={{
                    tabBarLabel: 'Menu',
                }}
            />
            <Tabs.Screen
                name='stock'
                options={{
                    tabBarLabel: 'Estoque',
                }}
            />
            <Tabs.Screen
                name='slips'
                options={{
                    tabBarLabel: 'Comandas',
                }}
            />
            <Tabs.Screen
                name='dishes'
                options={{
                    tabBarLabel: 'Cardápio',
                }}
            />
            <Tabs.Screen
                name='payment'
                options={{
                    tabBarLabel: 'Pagamento',
                }}
            />
        </Tabs>
    );
}

const TabBarIcon = ({ children }) => (
    <View style={styles.iconContainer}>
        {children}
    </View>
);

const styles = StyleSheet.create({
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 42,
        height: 28,
        position: 'relative',
        marginBottom: -5,
    },
    activeIndicator: {
        position: 'absolute',
        top: -5,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.white,
    },
});