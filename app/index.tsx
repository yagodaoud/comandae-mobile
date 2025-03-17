import React from 'react'
import { Redirect } from 'expo-router'
import { TouchableOpacity, Text, View } from 'react-native'
import { styles } from '@/styles/auth.styles'
import { useAuth } from '@clerk/clerk-react';

export default function Index() {
    const { signOut } = useAuth();
    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => signOut()}>
                <Text style={{ color: "black" }}>Sair</Text>
            </TouchableOpacity>
        </View>

    )
}