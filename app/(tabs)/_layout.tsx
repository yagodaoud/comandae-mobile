import React from 'react'
import { Tabs } from 'expo-router'
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.gray,
                tabBarStyle: {
                    backgroundColor: COLORS.secondary,
                    borderTopWidth: 0,
                    position: 'absolute',
                    elevation: 0,
                    height: 60,
                    paddingBottom: 10,
                    shadowOffset: {
                        width: 0,
                        height: 10
                    }
                }
            }}>
            <Tabs.Screen name='index'
                options={{
                    tabBarLabel: 'Menu',
                    tabBarIcon: ({ focused }) => (
                        <Feather
                            name='home'
                            size={24}
                            color={focused ? COLORS.primary : COLORS.gray}
                        />
                    )
                }}
            />

            <Tabs.Screen
                name='stock'

                options={{
                    tabBarLabel: 'Estoque',
                    tabBarIcon: ({ focused }) => (
                        <Feather
                            name='box'
                            size={24}
                            color={focused ? COLORS.primary : COLORS.gray}
                        />
                    )
                }}
            />

            <Tabs.Screen
                name='slips'
                options={{
                    tabBarLabel: 'Comandas',
                    tabBarIcon: ({ focused }) => (
                        <Feather
                            name='check-square'
                            size={24}
                            color={focused ? COLORS.primary : COLORS.gray}
                        />
                    )
                }}
            />

            <Tabs.Screen
                name='menu-generation'

                options={{
                    tabBarLabel: 'Cardápio',
                    tabBarIcon: ({ focused }) => (
                        <MaterialCommunityIcons
                            name="silverware-fork-knife"  // You can try this or similar alternatives
                            size={24}
                            color={focused ? COLORS.primary : COLORS.gray}
                        />
                    )
                }}
            />

            <Tabs.Screen
                name='payment'
                options={{
                    tabBarLabel: 'Pagamento',
                    tabBarIcon: ({ focused }) => (
                        <Feather
                            name='credit-card'
                            size={24}
                            color={focused ? COLORS.primary : COLORS.gray}
                        />
                    )
                }}
            />
        </Tabs>
    )
}
