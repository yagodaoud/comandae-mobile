import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

interface ConfigItemProps {
    label: string;
    onPress: () => void;
    icon?: string; // Make icon optional
    showChevron?: boolean; // Optional prop to show/hide chevron
}

const ConfigItem: React.FC<ConfigItemProps> = ({ label, onPress, icon, showChevron = true }) => {
    return (
        <TouchableOpacity style={styles.item} onPress={onPress}>
            <View style={styles.itemLeft}>
                {icon && <Feather name={icon as any} size={20} color={COLORS.secondary} />}
                <Text style={styles.itemLabel}>{label}</Text>
            </View>
            {showChevron && <Feather name="chevron-right" size={20} color={COLORS.secondary} />}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
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

export default ConfigItem; 