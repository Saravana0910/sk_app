export interface SalesforceSession {
    accessToken: string;
    refreshToken: string;
    clientId: string;
    userId: string;
    orgId: string;
    loginUrl: string;
    instanceUrl: string;
    userAgent: string;
}
