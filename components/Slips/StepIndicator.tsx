import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';

interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
    const steps = [
        { number: 1, label: 'Comanda' },
        { number: 2, label: 'Produtos' },
        { number: 3, label: 'Revisar' },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.stepsContainer}>
                {steps.map((step, index) => (
                    <React.Fragment key={step.number}>
                        <View style={styles.stepContainer}>
                            <View
                                style={[
                                    styles.step,
                                    currentStep >= step.number && styles.stepActive,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.stepNumber,
                                        currentStep >= step.number && styles.stepNumberActive,
                                    ]}
                                >
                                    {step.number}
                                </Text>
                            </View>
                            <Text
                                style={[
                                    styles.stepLabel,
                                    currentStep >= step.number && styles.stepLabelActive,
                                ]}
                            >
                                {step.label}
                            </Text>
                        </View>
                        {index < steps.length - 1 && (
                            <View
                                style={[
                                    styles.line,
                                    currentStep > step.number && styles.lineActive,
                                ]}
                            />
                        )}
                    </React.Fragment>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
    },
    stepsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stepContainer: {
        alignItems: 'center',
    },
    step: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    stepActive: {
        backgroundColor: COLORS.secondary,
    },
    stepNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#666',
    },
    stepNumberActive: {
        color: '#fff',
    },
    stepLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    stepLabelActive: {
        color: COLORS.secondary,
        fontWeight: '500',
    },
    line: {
        flex: 1,
        height: 2,
        backgroundColor: '#f0f0f0',
        marginHorizontal: 8,
        marginBottom: 20,
    },
    lineActive: {
        backgroundColor: COLORS.secondary,
    },
}); 