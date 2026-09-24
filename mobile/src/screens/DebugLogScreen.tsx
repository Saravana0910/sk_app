import React, { useEffect, useState } from 'react';
import { ScrollView, Share, StyleSheet, Text, View, Pressable } from 'react-native';
import { getDebugLogs, subscribeDebugLogs } from '../utils/debugLog';

/** On-device log viewer for troubleshooting without Metro/adb access. */
export function DebugLogScreen() {
    const [lines, setLines] = useState<string[]>(getDebugLogs());

    useEffect(() => subscribeDebugLogs(setLines), []);

    const handleShare = () => {
        Share.share({ message: lines.join('\n') || 'No logs yet.' });
    };

    return (
        <View style={styles.container}>
            <Pressable style={styles.shareButton} onPress={handleShare}>
                <Text style={styles.shareLabel}>Share / Save Logs</Text>
            </Pressable>
            <ScrollView style={styles.scroll}>
                <Text selectable style={styles.text}>
                    {lines.length > 0 ? lines.join('\n\n') : 'No logs yet.'}
                </Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0b0b0b',
    },
    shareButton: {
        margin: 12,
        backgroundColor: '#0070D2',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    shareLabel: {
        color: '#fff',
        fontWeight: '600',
    },
    scroll: {
        flex: 1,
        paddingHorizontal: 12,
    },
    text: {
        color: '#0f0',
        fontFamily: 'monospace',
        fontSize: 12,
    },
});
