import { AppState } from 'react-native';
import { oauth } from 'react-native-force';
import type { SalesforceSession } from '../types/auth';

const CREDENTIALS_POLL_INTERVAL_MS = 1000;

/**
 * Returns the current session if already logged in, otherwise triggers
 * the native Mobile SDK OAuth2 + PKCE login flow.
 *
 * When re-authenticating as a different user, the native login screen can
 * finish after the JS bridge has been torn down/recreated, which drops the
 * authenticate() callback and leaves the caller waiting forever. To recover
 * without forcing the user to restart the app, we also poll for freshly
 * persisted credentials and re-check whenever the app returns to the
 * foreground, resolving with whichever signal arrives first.
 */
export function ensureSession(): Promise<SalesforceSession> {
    return new Promise((resolve, reject) => {
        let settled = false;
        let pollTimer: ReturnType<typeof setInterval> | undefined;
        let appStateSubscription: { remove: () => void } | undefined;

        const settle = (fn: () => void) => {
            if (settled) {
                return;
            }
            settled = true;
            if (pollTimer) {
                clearInterval(pollTimer);
            }
            appStateSubscription?.remove();
            fn();
        };

        const checkExistingCredentials = () => {
            oauth.getAuthCredentials(
                (session: SalesforceSession) => settle(() => resolve(session)),
                () => {},
            );
        };

        pollTimer = setInterval(checkExistingCredentials, CREDENTIALS_POLL_INTERVAL_MS);
        appStateSubscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                checkExistingCredentials();
            }
        });

        oauth.getAuthCredentials(
            (session: SalesforceSession) => settle(() => resolve(session)),
            () => {
                oauth.authenticate(
                    (session: SalesforceSession) => settle(() => resolve(session)),
                    (error: unknown) => settle(() => reject(error)),
                );
            },
        );
    });
}

/** Logs out the current user, clearing the session and refresh token. */
export function logout(): Promise<void> {
    return new Promise((resolve, reject) => {
        oauth.logout(
            () => resolve(),
            (error: unknown) => reject(error),
        );
    });
}
