import React from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';
import { ErrorView } from '../components/ErrorView';
import { buildFrontDoorUrl } from '../utils/site';
import type { RootStackParamList } from '../types/navigation';

type Route = RouteProp<RootStackParamList, 'SiteWebView'>;

export function SiteWebViewScreen() {
    const { session } = useAuth();
    const { url, useSso } = useRoute<Route>().params;

    if (useSso && !session) {
        return <ErrorView message="Not authenticated." />;
    }

    // useSso=false intentionally skips the access token so the site's own login page is shown.
    const uri = useSso && session ? buildFrontDoorUrl(url, session.accessToken) : url;

    return (
        <WebView
            style={styles.webview}
            source={{ uri }}
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
        />
    );
}

const styles = StyleSheet.create({
    webview: {
        flex: 1,
    },
});
