import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { styles } from '@/styles/auth.styles'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '@/constants/theme'
import { useSSO } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import * as AuthSession from 'expo-auth-session';

export default function Login() {
    const { startSSOFlow } = useSSO();
    const router = useRouter();

    const handleGoogleSignIn = async () => {
        try {
            const redirectUrl = AuthSession.makeRedirectUri({
                path: 'expo-auth-session'
            });

            const { createdSessionId, setActive } = await startSSOFlow({
                strategy: "oauth_google",
                redirectUrl
            });

            if (setActive && createdSessionId) {
                await setActive({ session: createdSessionId });
            }
        } catch (error) {
            console.error('Error signing in with Google:', error);
        };
    }

    return (
        <View style={styles.container}>

            <View style={styles.brandSection}>
                <View style={styles.logoContainer}>
                    <Ionicons name="restaurant" size={32} color={COLORS.white} />
                </View>
                <Text style={styles.appName}>Comandaê</Text>
                <Text style={styles.tagline}>Gestão de Restaurantes</Text>
            </View>

            <View style={styles.illustrationContainer}>
                <Image source={require("@/assets/images/cooking-login.png")} style={styles.illustration} resizeMode='cover' />
            </View>

            <View style={styles.loginSection}>
                <TouchableOpacity style={styles.googleButton}
                    onPress={handleGoogleSignIn}
                    activeOpacity={0.9}>

                    <Image
                        source={require("@/assets/images/google-logo.png")}
                        style={styles.googleIconContainer}
                        resizeMode="contain"
                    />

                    <Text style={styles.googleButtonText}>Entrar com Google</Text>

                </TouchableOpacity>

                <Text style={styles.termsText}>Ao continuar, você concorda com os nossos Termos de Serviço e Politica de Privacidade.</Text>
            </View>
        </View>
    )
}