/** Builds a frontdoor.jsp URL that SSOs an authenticated session into a site URL. */
export function buildFrontDoorUrl(siteUrl: string, accessToken: string): string {
    const match = /^(https?:\/\/[^/]+)(\/.*)?$/.exec(siteUrl);
    const origin = match?.[1] ?? siteUrl;
    const path = match?.[2] || '/';
    return `${origin}/secur/frontdoor.jsp?sid=${encodeURIComponent(accessToken)}&retURL=${encodeURIComponent(path)}`;
}
