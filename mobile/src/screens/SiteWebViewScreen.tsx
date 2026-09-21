import React from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useAuth } from '../auth/AuthContext';
import { ErrorView } from '../components/ErrorView';
import { DEFAULT_SITE_URL } from '../config/site';
import { buildFrontDoorUrl } from '../utils/site';

export function SiteWebViewScreen() {
    const { session } = useAuth();

    if (!session) {
        return <ErrorView message="Not authenticated." />;
    }

    const uri = buildFrontDoorUrl(DEFAULT_SITE_URL, session.accessToken);

    return <WebView style={styles.webview} source={{ uri }} />;
}

const styles = StyleSheet.create({
    webview: {
        flex: 1,
    },
});
