import React, { useEffect, useState } from 'react';
import { ScrollView, Share, StyleSheet, Text, View, Pressable } from 'react-native';
import { getDebugLogs, logDebug, subscribeDebugLogs } from '../utils/debugLog';
import { getPushStatus, registerForPush, sendTestNotification } from '../utils/push';

/** On-device log viewer for troubleshooting without Metro/adb access. */
export function DebugLogScreen() {
    const [lines, setLines] = useState<string[]>(getDebugLogs());

    useEffect(() => subscribeDebugLogs(setLines), []);

    const handleShare = () => {
        Share.share({ message: lines.join('\n') || 'No logs yet.' });
    };

    const handleTestNotification = async () => {
        try {
            const status = await getPushStatus();
            logDebug('[Push] status:', JSON.stringify(status));
            const shown = await sendTestNotification();
            logDebug('[Push] test notification posted:', shown);
        } catch (e) {
            logDebug('[Push] test failed:', e instanceof Error ? e.message : String(e));
        }
    };

    // Registration is async, so the device id only shows up on a later status check.
    const handleRegisterForPush = async () => {
        try {
            await registerForPush();
            logDebug('[Push] registration requested; re-check status in a few seconds.');
        } catch (e) {
            logDebug('[Push] registration failed:', e instanceof Error ? e.message : String(e));
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.actions}>
                <Pressable style={styles.button} onPress={handleShare}>
                    <Text style={styles.buttonLabel}>Share Logs</Text>
                </Pressable>
                <Pressable style={styles.button} onPress={handleTestNotification}>
                    <Text style={styles.buttonLabel}>Test Notification</Text>
                </Pressable>
                <Pressable style={styles.button} onPress={handleRegisterForPush}>
                    <Text style={styles.buttonLabel}>Re-register Push</Text>
                </Pressable>
            </View>
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
    actions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        margin: 12,
    },
    button: {
        flex: 1,
        backgroundColor: '#0070D2',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonLabel: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,
        textAlign: 'center',
    },
    scroll: {
        flex: 1,
        paddingHorizontal: 12,
    },    text: {
        color: '#0f0',
        fontFamily: 'monospace',
        fontSize: 12,
    },
});
