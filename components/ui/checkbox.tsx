import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface CheckboxProps {
    checked: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    size?: number;
}

export function Checkbox({
    checked,
    onCheckedChange,
    disabled = false,
    size = 24
}: CheckboxProps) {
    const handlePress = () => {
        if (!disabled && onCheckedChange) {
            onCheckedChange(!checked);
        }
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            disabled={disabled}
            style={[
                styles.container,
                { width: size, height: size },
                checked ? styles.checked : styles.unchecked,
                disabled && styles.disabled
            ]}
            activeOpacity={0.7}
        >
            {checked && (
                <MaterialCommunityIcons
                    name="check"
                    size={size * 0.7}
                    color={COLORS.white}
                />
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 6,
        borderWidth: 2,
    },
    checked: {
        backgroundColor: COLORS.secondary,
        borderColor: COLORS.secondary,
    },
    unchecked: {
        backgroundColor: 'transparent',
        borderColor: COLORS.gray,
    },
    disabled: {
        opacity: 0.5,
    },
}); 