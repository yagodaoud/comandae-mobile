import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface EmptyStateProps {
    icon: string;
    message: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, message }) => {
    return (
        <View style={styles.emptyState}>
            <Feather name={icon} size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>{message}</Text>
        </View>
    );
};

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
    }
});

export default EmptyState;