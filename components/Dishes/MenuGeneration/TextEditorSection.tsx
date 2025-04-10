import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Keyboard } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

const TextEditorSection = ({ title, initialText, onTextChange, placeholder }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempText, setTempText] = useState(initialText);
    const inputRef = useRef(null);

    const startEditing = () => {
        setTempText(initialText);
        setIsEditing(true);
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    };

    const saveText = () => {
        onTextChange(tempText);
        setIsEditing(false);
        Keyboard.dismiss();
    };

    const cancelEdit = () => {
        setTempText(initialText);
        setIsEditing(false);
        Keyboard.dismiss();
    };

    return (
        <View style={styles.textSection}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{title}</Text>
                {!isEditing && (
                    <TouchableOpacity onPress={startEditing} style={styles.editButton}>
                        <Feather name="edit-2" size={18} color={COLORS.secondary} />
                    </TouchableOpacity>
                )}
            </View>
            {isEditing ? (
                <View>
                    <TextInput
                        ref={inputRef}
                        style={styles.textInputSection}
                        value={tempText}
                        onChangeText={setTempText}
                        multiline
                        blurOnSubmit={false}
                        returnKeyType="next"
                        placeholder={placeholder}
                        placeholderTextColor={COLORS.textSecondary ?? '#888'}
                    />
                    <View style={styles.editButtonsContainer}>
                        <TouchableOpacity
                            style={styles.cancelEditButton}
                            onPress={cancelEdit}
                        >
                            <Feather name="x" size={16} color={COLORS.error ?? '#e53935'} />
                            <Text style={styles.cancelEditText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.saveEditButton}
                            onPress={saveText}
                        >
                            <Feather name="check" size={16} color={COLORS.success ?? '#4caf50'} />
                            <Text style={styles.saveEditText}>Salvar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <Text style={styles.menuTextDisplay}>
                    {initialText || `Nenhum ${title.toLowerCase()} definido`}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    textSection: {
        marginBottom: 25,
        backgroundColor: COLORS.white ?? '#fff',
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.primary ?? '#333',
    },
    editButton: {
        padding: 5,
    },
    editButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
        gap: 10,
    },
    cancelEditButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        backgroundColor: '#ffebee',
    },
    saveEditButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        backgroundColor: '#e8f5e9',
    },
    cancelEditText: {
        marginLeft: 5,
        color: COLORS.error ?? '#e53935',
        fontWeight: '500',
        fontSize: 14,
    },
    saveEditText: {
        marginLeft: 5,
        color: COLORS.success ?? '#4caf50',
        fontWeight: '500',
        fontSize: 14,
    },
    menuTextDisplay: {
        fontSize: 14,
        color: COLORS.textPrimary ?? '#222',
        lineHeight: 22,
        paddingVertical: 5,
    },
    textInputSection: {
        fontSize: 14,
        color: COLORS.textPrimary ?? '#222',
        lineHeight: 22,
        padding: 10,
        backgroundColor: '#f8f9fa',
        borderRadius: 6,
        minHeight: 80,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
});

export default TextEditorSection;