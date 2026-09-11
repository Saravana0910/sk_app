import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ensureSession, logout as logoutSession } from './session';
import { getErrorMessage } from '../utils/errors';
import type { SalesforceSession } from '../types/auth';

interface AuthContextValue {
    session: SalesforceSession | null;
    loading: boolean;
    error: string | null;
    retry: () => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<SalesforceSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const login = useCallback(() => {
        setLoading(true);
        setError(null);
        ensureSession()
            .then((s) => setSession(s))
            .catch((e) => setError(getErrorMessage(e)))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        login();
    }, [login]);

    const logout = useCallback(async () => {
        await logoutSession();
        setSession(null);
        login();
    }, [login]);

    return (
        <AuthContext.Provider value={{ session, loading, error, retry: login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
