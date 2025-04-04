import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';

interface EmojiSelectorProps {
    options: string[];
    selectedEmoji: string;
    onSelect: (emoji: string) => void;
}

export const EmojiSelector = ({
    options,
    selectedEmoji,
    onSelect
}: EmojiSelectorProps) => {
    return (
        <View style={styles.formGroup}>
            <Text style={styles.label}>Emoji</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiContainer}>
                {options.map(emoji => (
                    <TouchableOpacity
                        key={emoji}
                        style={[
                            styles.emojiButton,
                            selectedEmoji === emoji && styles.selectedEmoji
                        ]}
                        onPress={() => onSelect(emoji)}
                    >
                        <Text style={styles.emojiText}>{emoji}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#555',
    },
    emojiContainer: {
        flexDirection: 'row',
        marginTop: 8,
    },
    emojiButton: {
        padding: 12,
        borderRadius: 8,
        marginRight: 8,
        backgroundColor: '#f0f0f0',
    },
    selectedEmoji: {
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.secondary,
    },
    emojiText: {
        fontSize: 24,
    },
});