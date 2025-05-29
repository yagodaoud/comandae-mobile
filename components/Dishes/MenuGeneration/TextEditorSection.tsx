import React, { memo, useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';

interface TextEditorSectionProps {
    title: string;
    initialText: string;
    onTextChange: (text: string) => void;
    placeholder?: string;
    emptyIcon?: string;
    emptyLabel?: string;
}

const TextEditorSection = memo(({
    title,
    initialText,
    onTextChange,
    placeholder,
    emptyIcon = "file-text",
    emptyLabel = "Nenhum texto definido"
}: TextEditorSectionProps) => {
    const [localText, setLocalText] = useState(initialText);
    const [isEditing, setIsEditing] = useState(false);

    // Update localText when initialText changes
    useEffect(() => {
        setLocalText(initialText);
    }, [initialText]);

    const handleTextChange = useCallback((text: string) => {
        setLocalText(text);
    }, []);

    const handleSave = useCallback(() => {
        onTextChange(localText);
        setIsEditing(false);
    }, [localText, onTextChange]);

    const hasContent = localText && localText.trim().length > 0;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <TouchableOpacity
                    onPress={() => isEditing ? handleSave() : setIsEditing(true)}
                    style={styles.editButton}
                >
                    <Feather
                        name={isEditing ? "check" : "edit-2"}
                        size={20}
                        color={COLORS.secondary}
                    />
                </TouchableOpacity>
            </View>
            {isEditing ? (
                <TextInput
                    style={styles.input}
                    value={localText}
                    onChangeText={handleTextChange}
                    placeholder={placeholder}
                    placeholderTextColor="#888"
                    multiline
                    numberOfLines={8}
                />
            ) : hasContent ? (
                <Text style={styles.displayText}>{localText}</Text>
            ) : (
                <View style={styles.emptyState}>
                    <Feather name={emptyIcon} size={24} color={COLORS.gray[400]} />
                    <Text style={styles.emptyLabel}>{emptyLabel}</Text>
                </View>
            )}
        </View>
    );
});

TextEditorSection.displayName = 'TextEditorSection';

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.white,
        borderRadius: 8,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.black,
    },
    editButton: {
        padding: 8,
    },
    input: {
        backgroundColor: COLORS.tertiary,
        borderRadius: 8,
        padding: 12,
        minHeight: 150,
        textAlignVertical: 'top',
        color: COLORS.black,
        fontSize: 16,
        lineHeight: 24,
    },
    displayText: {
        color: COLORS.black,
        fontSize: 16,
        lineHeight: 24,
        padding: 12,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: COLORS.tertiary,
        borderRadius: 8,
        minHeight: 150,
    },
    emptyLabel: {
        marginTop: 8,
        color: COLORS.gray[500],
        fontSize: 14,
    },
});

export default TextEditorSection;