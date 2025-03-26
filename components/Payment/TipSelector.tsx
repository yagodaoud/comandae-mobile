import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';

interface TipSelectorProps {
    tipPercentage: number;
    setTipPercentage: (percentage: number) => void;
}

export const TipSelector: React.FC<TipSelectorProps> = ({ tipPercentage, setTipPercentage }) => {
    return (
        <View style={styles.tipCard}>
            <View style={styles.tipButtonsContainer}>
                {[0, 5, 10, 15, 20].map((percentage) => (
                    <TouchableOpacity
                        key={percentage}
                        style={[
                            styles.tipButton,
                            tipPercentage === percentage && styles.tipButtonActive,
                        ]}
                        onPress={() => setTipPercentage(percentage)}
                    >
                        <Text
                            style={[
                                styles.tipButtonText,
                                tipPercentage === percentage && styles.tipButtonTextActive,
                            ]}
                        >
                            {percentage}%
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    tipCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    tipButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    tipButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginHorizontal: 4,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
    },
    tipButtonActive: {
        backgroundColor: COLORS.secondary,
    },
    tipButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
    },
    tipButtonTextActive: {
        color: '#fff',
    },
});