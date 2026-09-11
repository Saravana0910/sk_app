import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export function LoadingView({ message = 'Loading…' }: { message?: string }) {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" />
            <Text style={styles.text}>{message}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        marginTop: 12,
        fontSize: 16,
        color: '#444',
    },
});
