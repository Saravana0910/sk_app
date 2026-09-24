import { DeviceEventEmitter } from 'react-native';

/** Raw key/value payload delivered from a Salesforce push/Custom Notification. */
export type SalesforcePushPayload = Record<string, string>;

/** Subscribes to native push payloads bridged from MainApplication.kt's pushNotificationReceiver. */
export function onSalesforcePushNotification(handler: (payload: SalesforcePushPayload) => void) {
    const subscription = DeviceEventEmitter.addListener('sfPushNotification', handler);
    return () => subscription.remove();
}
