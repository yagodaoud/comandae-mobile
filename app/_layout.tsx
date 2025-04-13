import { COLORS } from "@/constants/theme";
import React from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import InitialLayout from "@/components/InitialLayout";
import ClerkAndConvexProvider from "@/providers/ClerkAndConvexProvider";
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <ClerkAndConvexProvider>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'none',
            }}
          >
            <InitialLayout />
          </Stack>
        </SafeAreaView>
      </SafeAreaProvider>
    </ClerkAndConvexProvider>
  )
}
