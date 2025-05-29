import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { COLORS } from '@/constants/theme';
import { useAuth } from '@clerk/clerk-expo';

interface TransparentHeaderProps {
    title?: string;
    backButton?: boolean;
    onBackPress?: () => void;
    icon?: React.ReactNode;
}

const TransparentHeader = ({
    title,
    backButton = false,
    onBackPress = () => { },
    icon,
}: TransparentHeaderProps) => {
    const pathname = usePathname();
    const router = useRouter();
    const { signOut } = useAuth();
    const [isUserMenuVisible, setIsUserMenuVisible] = useState(false);

    const getPageName = () => {
        if (!title) {
            const pageNames: Record<string, string> = {
                '/': 'Home',
                '/stock': 'Estoque',
                '/slips': 'Comandas',
                '/dishes': 'Cardápio',
                '/payment': 'Pagamento'
            };

            return pageNames[pathname] || 'Page';
        }
        return title;
    };

    const handleLogout = async () => {
        try {
            await signOut();
            router.replace('/(auth)/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.leftContainer}>
                {backButton && (
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={onBackPress}
                    >
                        <Feather name="chevron-left" size={24} color={COLORS.gray} />
                    </TouchableOpacity>
                )}
                <Text style={styles.title}>{getPageName()}</Text>
            </View>
            <View style={styles.iconContainer}>
                {icon ? (
                    icon
                ) : (
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => setIsUserMenuVisible(true)}
                    >
                        <Feather name="user" size={24} color={COLORS.gray} />
                    </TouchableOpacity>
                )}
            </View>

            <Modal
                animationType="fade"
                transparent={true}
                visible={isUserMenuVisible}
                onRequestClose={() => setIsUserMenuVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setIsUserMenuVisible(false)}
                >
                    <View style={styles.menuContainer}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={handleLogout}
                        >
                            <Feather name="log-out" size={20} color={COLORS.gray} />
                            <Text style={styles.menuText}>Sair</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 10,
        backgroundColor: 'transparent',
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.gray,
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        marginLeft: 16,
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
    },
    menuContainer: {
        position: 'absolute',
        top: 60,
        right: 16,
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 8,
        minWidth: 150,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 4,
    },
    menuText: {
        marginLeft: 12,
        fontSize: 16,
        color: COLORS.gray,
    }
});

export default TransparentHeader;