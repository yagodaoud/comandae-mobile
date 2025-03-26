import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface EmptyStateProps {
    icon: React.ReactNode;
    message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, message }) => {
    return (
        <View style={styles.emptyState}>
            {icon}
            <Text style={styles.emptyStateText}>{message}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 64,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#888',
        marginTop: 16,
    },
})