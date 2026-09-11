/** Extracts a safe, user-presentable message from an unknown error value. Never surfaces raw objects/stacks to the UI. */
export function getErrorMessage(error: unknown): string {
    if (typeof error === 'string') {
        return error;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unexpected error occurred. Please try again.';
}
