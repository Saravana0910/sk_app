/** Extracts a safe, user-presentable message from an unknown error value. Falls back to a generic message only when nothing usable can be found. */
export function getErrorMessage(error: unknown): string {
    if (typeof error === 'string' && error) {
        return error;
    }
    if (error instanceof Error && error.message) {
        return error.message;
    }
    // The Salesforce REST API (via react-native-force) rejects with an array of
    // { message, errorCode } objects; OAuth failures use { error, error_description }.
    if (Array.isArray(error) && error.length > 0) {
        return error.map((item) => getErrorMessage(item)).join(' ');
    }
    if (error && typeof error === 'object') {
        const candidate = error as Record<string, unknown>;
        for (const key of ['message', 'errorMessage', 'error_description', 'description', 'error', 'errorCode']) {
            if (candidate[key]) {
                return getErrorMessage(candidate[key]);
            }
        }
        try {
            const serialized = JSON.stringify(candidate);
            if (serialized && serialized !== '{}') {
                return serialized;
            }
        } catch {
            // Circular or non-serializable object - fall through to the generic message below.
        }
    }
    if (typeof error === 'number' || typeof error === 'boolean') {
        return String(error);
    }
    return 'An unexpected error occurred. Please try again.';
}
