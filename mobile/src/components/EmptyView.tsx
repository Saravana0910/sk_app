import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function EmptyView({ message }: { message: string }) {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>{message}</Text>
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
    text: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
    },
});
