import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { usePathname } from 'expo-router';
import { COLORS } from '@/constants/theme';

const TransparentHeader = ({ title, backButton = false, onBackPress = () => { } }) => {
    const pathname = usePathname();

    const getPageName = () => {
        if (!title) {
            const pageNames = {
                '/': 'Home',
                '/stock': 'Estoque',
                '/slips': 'Comandas',
                '/menu-generation': 'Cardápio',
                '/payment': 'Pagamento'
            };

            return pageNames[pathname] || 'Page';
        }
        return title;
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
                <TouchableOpacity style={styles.iconButton}>
                    <Feather name="user" size={24} color={COLORS.gray} />
                </TouchableOpacity>
            </View>
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
    }
});

export default TransparentHeader;