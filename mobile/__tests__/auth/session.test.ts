jest.mock('react-native-force', () => ({
    oauth: {
        getAuthCredentials: jest.fn(),
        authenticate: jest.fn(),
        logout: jest.fn(),
    },
}));

import { oauth } from 'react-native-force';
import { ensureSession, logout } from '../../src/auth/session';

describe('ensureSession', () => {
    afterEach(() => jest.resetAllMocks());

    it('resolves immediately when a session already exists', async () => {
        (oauth.getAuthCredentials as jest.Mock).mockImplementation((success) => success({ accessToken: 'existing-token' }));

        const session = await ensureSession();

        expect(session.accessToken).toBe('existing-token');
        expect(oauth.authenticate).not.toHaveBeenCalled();
    });

    it('falls back to authenticate() when there is no existing session', async () => {
        (oauth.getAuthCredentials as jest.Mock).mockImplementation((_success, fail) => fail('no session'));
        (oauth.authenticate as jest.Mock).mockImplementation((success) => success({ accessToken: 'new-token' }));

        const session = await ensureSession();

        expect(session.accessToken).toBe('new-token');
    });

    it('rejects when authenticate() fails', async () => {
        (oauth.getAuthCredentials as jest.Mock).mockImplementation((_success, fail) => fail('no session'));
        (oauth.authenticate as jest.Mock).mockImplementation((_success, fail) => fail('user cancelled'));

        await expect(ensureSession()).rejects.toBe('user cancelled');
    });
});

describe('logout', () => {
    afterEach(() => jest.resetAllMocks());

    it('resolves when the native logout succeeds', async () => {
        (oauth.logout as jest.Mock).mockImplementation((success) => success());

        await expect(logout()).resolves.toBeUndefined();
    });

    it('rejects when the native logout fails', async () => {
        (oauth.logout as jest.Mock).mockImplementation((_success, fail) => fail('logout failed'));

        await expect(logout()).rejects.toBe('logout failed');
    });
});
