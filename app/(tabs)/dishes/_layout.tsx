import { Stack } from 'expo-router';
import { COLORS } from '@/constants/theme';
export default function DishesStackLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerStyle: { backgroundColor: COLORS.background },
                headerTintColor: COLORS.secondary,
                headerTitleStyle: { color: COLORS.primary },
            }}
        >
            <Stack.Screen
                name="index"
                options={{ headerShown: false }}
            />
        </Stack>
    );
}