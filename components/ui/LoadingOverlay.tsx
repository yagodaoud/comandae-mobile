import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';

interface LoadingOverlayProps {
    size?: 'small' | 'large';
    color?: string;
    backgroundColor?: string;
    overlayOpacity?: number;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    size = 'large',
    color = COLORS.secondary,
    backgroundColor = COLORS.background,
    overlayOpacity = 0.5
}) => {
    return (
        <View style={[styles.container, { backgroundColor: `${backgroundColor}${Math.round(overlayOpacity * 255).toString(16).padStart(2, '0')}` }]}>
            <ActivityIndicator size={size} color={color} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
}); 