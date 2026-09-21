import React, { useCallback, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { DEFAULT_SITE_URL } from '../config/site';

/**
 * Floating, bottom-center button that launches the org's default
 * Experience Cloud site, signing the user in via frontdoor.jsp SSO.
 */
export function LaunchSiteButton() {
    const { session } = useAuth();
    const [launching, setLaunching] = useState(false);

    const handlePress = useCallback(async () => {
        if (!session || launching) {
            return;
        }
        setLaunching(true);
        try {
            const siteUrl = new URL(DEFAULT_SITE_URL);
            const frontDoorUrl = `${siteUrl.origin}/secur/frontdoor.jsp?sid=${encodeURIComponent(
                session.accessToken,
            )}&retURL=${encodeURIComponent(siteUrl.pathname || '/')}`;
            await Linking.openURL(frontDoorUrl);
        } finally {
            setLaunching(false);
        }
    }, [session, launching]);

    return (
        <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={handlePress}
            disabled={launching}>
            <Text style={styles.label}>{launching ? 'Launching…' : 'Launch Site'}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        bottom: 24,
        alignSelf: 'center',
        backgroundColor: '#0070D2',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 28,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    buttonPressed: {
        opacity: 0.8,
    },
    label: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
