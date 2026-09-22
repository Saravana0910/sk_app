import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { CUSTOM_SITE_URL } from '../config/site';
import type { RootStackParamList } from '../types/navigation';

type Navigation = StackNavigationProp<RootStackParamList, 'CaseList'>;

/**
 * Launches a separate site in-app without SSO, so the site's own login page
 * handles authentication instead of the logged-in Mobile SDK session.
 */
export function CustomSiteButton() {
    const navigation = useNavigation<Navigation>();

    const handlePress = useCallback(() => {
        navigation.navigate('SiteWebView', { url: CUSTOM_SITE_URL, useSso: false });
    }, [navigation]);

    return (
        <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={handlePress}>
            <Text style={styles.label}>Custom Site</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#54698D',
        paddingVertical: 14,
        paddingHorizontal: 24,
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
