import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';
import { ErrorView } from '../components/ErrorView';
import { LoadingView } from '../components/LoadingView';
import { getFrontDoorUrl } from '../utils/singleAccess';
import { logDebug } from '../utils/debugLog';
import type { RootStackParamList } from '../types/navigation';

type Route = RouteProp<RootStackParamList, 'SiteWebView'>;

export function SiteWebViewScreen() {
    const { session } = useAuth();
    const { url, useSso } = useRoute<Route>().params;
    // useSso=false intentionally skips the UI Bridge so the site's own login page is shown.
    const [uri, setUri] = useState<string | null>(useSso ? null : url);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!useSso) {
            return;
        }
        if (!session) {
            setError('Not authenticated.');
            return;
        }
        getFrontDoorUrl(url)
            .then((frontDoorUrl) => {
                logDebug('[SiteWebView] frontDoorUrl (UI Bridge):', frontDoorUrl);
                setUri(frontDoorUrl);
            })
            .catch((e) => {
                logDebug('[SiteWebView] UI Bridge error:', String(e));
                setError('Unable to open the site.');
            });
    }, [useSso, session, url]);

    if (error) {
        return <ErrorView message={error} />;
    }

    if (!uri) {
        return <LoadingView message="Opening site…" />;
    }

    return (
        <WebView
            style={styles.webview}
            source={{ uri }}
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
            onNavigationStateChange={(navState) => logDebug('[SiteWebView] navigated to:', navState.url)}
        />
    );
}

const styles = StyleSheet.create({
    webview: {
        flex: 1,
    },
});
