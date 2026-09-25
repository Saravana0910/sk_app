import { DeviceEventEmitter, NativeModules } from 'react-native';

const { PushDiagnostics } = NativeModules;

/** Raw key/value payload delivered from a Salesforce push/Custom Notification. */
export type SalesforcePushPayload = Record<string, string>;

/** Subscribes to native push payloads bridged from MainApplication.kt's pushNotificationReceiver. */
export function onSalesforcePushNotification(handler: (payload: SalesforcePushPayload) => void) {
    const subscription = DeviceEventEmitter.addListener('sfPushNotification', handler);
    return () => subscription.remove();
}

export type PushStatus = {
    notificationsEnabled: boolean;
    /** Null until the org creates a MobilePushServiceDevice row for this device. */
    salesforceDeviceId: string | null;
    storedFcmToken: string | null;
    liveFcmToken: string | null;
};

export function getPushStatus(): Promise<PushStatus> {
    return PushDiagnostics.getStatus();
}

/** Posts a local notification through the same code path a real Salesforce push takes. */
export function sendTestNotification(): Promise<boolean> {
    return PushDiagnostics.sendTestNotification();
}

/** Re-runs Salesforce device registration, which the SDK otherwise only does at login. */
export function registerForPush(): Promise<void> {
    return PushDiagnostics.registerForPush();
}

/** The full token, for the Firebase console test sender. Keep it out of the shareable debug log. */
export function getFcmToken(): Promise<string> {
    return PushDiagnostics.getFcmToken();
}
