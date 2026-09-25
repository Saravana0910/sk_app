import { NativeModules } from 'react-native';

const { SingleAccessBridge } = NativeModules;

/**
 * Exchanges the current Mobile SDK session for a one-time authenticated
 * frontdoor URL via the native SingleAccessModule (Identity API UI Bridge),
 * instead of the app constructing frontdoor.jsp with a raw access token.
 */
export function getFrontDoorUrl(siteUrl: string): Promise<string> {
    return SingleAccessBridge.getFrontDoorUrl(siteUrl);
}
