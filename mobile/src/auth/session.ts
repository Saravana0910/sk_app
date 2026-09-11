import { oauth } from 'react-native-force';
import type { SalesforceSession } from '../types/auth';

/**
 * Returns the current session if already logged in, otherwise triggers
 * the native Mobile SDK OAuth2 + PKCE login flow.
 */
export function ensureSession(): Promise<SalesforceSession> {
    return new Promise((resolve, reject) => {
        oauth.getAuthCredentials(
            (session: SalesforceSession) => resolve(session),
            () => {
                oauth.authenticate(
                    (session: SalesforceSession) => resolve(session),
                    (error: unknown) => reject(error),
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
