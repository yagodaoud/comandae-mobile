import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';

interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
    return (
        <View style={styles.container}>
            {Array.from({ length: totalSteps }).map((_, index) => (
                <React.Fragment key={index}>
                    <View style={styles.stepContainer}>
                        <View style={[
                            styles.stepCircle,
                            index + 1 <= currentStep && styles.stepCircleActive
                        ]}>
                            <Text style={[
                                styles.stepNumber,
                                index + 1 <= currentStep && styles.stepNumberActive
                            ]}>
                                {index + 1}
                            </Text>
                        </View>
                        {index < totalSteps - 1 && (
                            <View style={[
                                styles.line,
                                index + 1 < currentStep && styles.lineActive
                            ]} />
                        )}
                    </View>
                </React.Fragment>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    stepContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#ddd',
    },
    stepCircleActive: {
        backgroundColor: COLORS.secondary,
        borderColor: COLORS.secondary,
    },
    stepNumber: {
        fontSize: 16,
        color: '#666',
        fontWeight: 'bold',
    },
    stepNumberActive: {
        color: '#fff',
    },
    line: {
        width: 60,
        height: 2,
        backgroundColor: '#ddd',
    },
    lineActive: {
        backgroundColor: COLORS.secondary,
    },
}); 