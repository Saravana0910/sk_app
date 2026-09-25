/*
 * Copyright (c) 2020-present, salesforce.com, inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided
 * that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of conditions and the
 * following disclaimer.
 *
 * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and
 * the following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * Neither the name of salesforce.com, inc. nor the names of its contributors may be used to endorse or
 * promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import type { NavigationContainerRef } from '@react-navigation/native';
import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';
import { AuthProvider, useAuth } from './src/auth/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { LoadingView } from './src/components/LoadingView';
import { ErrorView } from './src/components/ErrorView';
import { onSalesforcePushNotification } from './src/utils/push';
import { logDebug } from './src/utils/debugLog';
import type { RootStackParamList } from './src/types/navigation';

function AppContent(): React.JSX.Element {
    const { session, loading, error, retry } = useAuth();
    const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

    useEffect(() => {
        // Android 13+ silently drops notifications without this runtime grant.
        if (Platform.OS === 'android' && Platform.Version >= 33) {
            PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS).then((result) => {
                logDebug('[Push] POST_NOTIFICATIONS permission:', result);
                // "never_ask_again" means Android will no longer show the dialog, so only Settings can grant it.
                if (result === 'never_ask_again') {
                    Alert.alert(
                        'Notifications are blocked',
                        'Enable notifications for this app in Android Settings to receive Salesforce alerts.',
                        [{ text: 'Not now' }, { text: 'Open Settings', onPress: () => Linking.openSettings() }],
                    );
                }
            });
        }

        // "sfdc.ID" is the target record Id set via Messaging.CustomNotification.setTargetId in Apex/Flow.
        return onSalesforcePushNotification((payload) => {
            logDebug('[Push] received:', JSON.stringify(payload));
            const caseId = payload['sfdc.ID'];
            if (caseId) {
                navigationRef.current?.navigate('CaseDetail', { caseId });
            }
        });
    }, []);

    if (loading) {
        return <LoadingView message="Signing in…" />;
    }

    if (error || !session) {
        return <ErrorView message={error ?? 'Not authenticated.'} onRetry={retry} />;
    }

    return (
        <NavigationContainer ref={navigationRef}>
            <AppNavigator />
        </NavigationContainer>
    );
}

function App(): React.JSX.Element {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;

