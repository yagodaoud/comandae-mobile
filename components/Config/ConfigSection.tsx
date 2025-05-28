import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

interface ConfigItem {
    icon: string;
    label: string;
    onPress: () => void;
}

interface ConfigSectionProps {
    title: string;
    items: ConfigItem[];
}

const ConfigSection: React.FC<ConfigSectionProps> = ({ title, items }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.itemsContainer}>
                {items.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.item}
                        onPress={item.onPress}
                    >
                        <View style={styles.itemLeft}>
                            <Feather name={item.icon as any} size={20} color={COLORS.secondary} />
                            <Text style={styles.itemLabel}>{item.label}</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color={COLORS.secondary} />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.secondary,
        marginBottom: 12,
    },
    itemsContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        overflow: 'hidden',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemLabel: {
        marginLeft: 12,
        fontSize: 16,
        color: COLORS.gray,
    },
});

export default ConfigSection; 