import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable, Dimensions, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { useRouter } from 'expo-router';

interface ActionMenuProps {
    visible: boolean;
    position: { x: number; y: number };
    onClose: () => void;
}

export default function ActionMenu({ visible, position, onClose }: ActionMenuProps) {
    const router = useRouter();
    const screenWidth = Dimensions.get('window').width;
    const menuWidth = 200;
    const cardWidth = screenWidth * 0.48; // 48% of screen width (from ComandaCard)
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Start scale animation after 100ms
            setTimeout(() => {
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 7,
                }).start();
            }, 100);
        } else {
            scaleAnim.setValue(0);
        }
    }, [visible]);

    const handlePayment = () => {
        onClose();
        router.push('/payment');
    };

    // Calculate if the card is on the left or right side
    const isLeftSide = position.x < screenWidth / 2;

    // Calculate menu position
    const menuLeft = isLeftSide
        ? position.x + (cardWidth / 2) - (menuWidth / 2) // Center over left card
        : position.x - (cardWidth / 2) - (menuWidth / 2); // Center over right card

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <Pressable
                style={styles.overlay}
                onPress={onClose}
            >
                <Animated.View
                    style={[
                        styles.menu,
                        {
                            position: 'absolute',
                            left: menuLeft,
                            top: position.y - 60, // Position above the card
                            transform: [{ scale: scaleAnim }],
                            opacity: scaleAnim,
                        },
                    ]}
                >
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handlePayment}
                    >
                        <Feather name="credit-card" size={20} color={COLORS.primary} />
                        <Text style={styles.actionText}>Fechar Comanda</Text>
                    </TouchableOpacity>
                </Animated.View>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
    },
    menu: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 8,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        width: 200,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 8,
    },
    actionText: {
        fontSize: 16,
        color: '#333',
    },
}); 