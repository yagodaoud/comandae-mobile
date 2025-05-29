import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

const ImageUploadSection = ({ imageUri, onImagePress, isProcessing }) => {
    return (
        <View>
            <TouchableOpacity
                style={styles.imageUploadArea}
                onPress={onImagePress}
                activeOpacity={0.7}
                disabled={isProcessing}
            >
                {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.previewImage} />
                ) : (
                    <View style={styles.uploadPrompt}>
                        <Feather name="camera" size={40} color={COLORS.secondary} />
                        <Text style={styles.uploadText}>Toque para carregar ou tirar foto</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    areaTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.primary ?? '#333',
        marginBottom: 10,
    },
    imageUploadArea: {
        height: 220,
        borderWidth: 2,
        borderColor: COLORS.secondary ?? '#aaa',
        borderStyle: 'dashed',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        overflow: 'hidden',
        marginBottom: 20,
    },
    uploadPrompt: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    uploadText: {
        marginTop: 12,
        fontSize: 14,
        color: COLORS.textSecondary ?? '#555',
        textAlign: 'center',
        fontWeight: '500',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
});

export default ImageUploadSection;