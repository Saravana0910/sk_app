type Listener = (lines: string[]) => void;

const lines: string[] = [];
const listeners = new Set<Listener>();

/** In-memory, on-device log store so logs are viewable without Metro/adb (e.g. release builds). */
export function logDebug(...parts: unknown[]): void {
    const line = `${new Date().toISOString()} ${parts.map(String).join(' ')}`;
    lines.push(line);
    listeners.forEach((listener) => listener([...lines]));
}

export function getDebugLogs(): string[] {
    return [...lines];
}

export function subscribeDebugLogs(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}
