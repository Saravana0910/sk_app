import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../auth/AuthContext';
import type { RootStackParamList } from '../types/navigation';

type Navigation = StackNavigationProp<RootStackParamList, 'CaseList'>;

/**
 * Floating, bottom-center button that launches the org's default
 * Experience Cloud site in-app, signing the user in via frontdoor.jsp SSO.
 */
export function LaunchSiteButton() {
    const { session } = useAuth();
    const navigation = useNavigation<Navigation>();

    const handlePress = useCallback(() => {
        if (!session) {
            return;
        }
        navigation.navigate('SiteWebView');
    }, [session, navigation]);

    return (
        <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={handlePress}>
            <Text style={styles.label}>Launch Site</Text>
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
