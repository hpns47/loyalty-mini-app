export interface IQrCodeResponse {
    qrDataUrl: string;
    deepLink: string;
}

export interface IUserQrResponse {
    qrDataUrl: string;
    expiresAt: number;
}
