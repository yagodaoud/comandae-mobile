import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

interface WelcomeHeaderProps {
    username: string;
}

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ username }) => {
    const router = useRouter();

    return (
        <>
            <Text style={styles.welcomeTitle}>Bem vindo, {username}!</Text>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push('/config')}
                >
                    <Text style={styles.buttonText}>Configurações</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Planos</Text>
                </TouchableOpacity>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
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
});

export default WelcomeHeader;