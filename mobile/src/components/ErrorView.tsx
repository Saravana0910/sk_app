import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>{message}</Text>
            {onRetry && (
                <Pressable style={styles.button} onPress={onRetry}>
                    <Text style={styles.buttonText}>Retry</Text>
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#B00020',
        marginBottom: 8,
    },
    message: {
        fontSize: 14,
        color: '#444',
        textAlign: 'center',
        marginBottom: 16,
    },
    button: {
        backgroundColor: '#0070D2',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 6,
    },
    buttonText: {
        color: 'white',
        fontWeight: '600',
    },
});
