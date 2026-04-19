import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as QRCode from "qrcode";
import * as jwt from "jsonwebtoken";
import { IQrCodeResponse, IUserQrResponse } from "./interfaces/qr-response.interface";

@Injectable()
export class QrService {
    private readonly qrSecret: string;
    private readonly botUsername: string;
    private readonly miniAppName: string;

    constructor(private readonly configService: ConfigService) {
        this.qrSecret = this.configService.get<string>("qrSecret");
        this.botUsername = this.configService.get<string>("botUsername");
        this.miniAppName = this.configService.get<string>("miniAppName");
    }

    async generateShopQr(shopId: string): Promise<IQrCodeResponse> {
        const deepLink = `https://t.me/${this.botUsername}/${this.miniAppName}?startapp=${shopId}`;
        const qrDataUrl = await QRCode.toDataURL(deepLink, {
            width: 256,
            margin: 2,
        });
        return { qrDataUrl, deepLink };
    }

    async generateUserQr(userId: string): Promise<IUserQrResponse> {
        const iat = Math.floor(Date.now() / 1000);
        const exp = iat + 60;
        const token = jwt.sign({ sub: userId, iat, exp }, this.qrSecret, {
            algorithm: "HS256",
        });
        const qrDataUrl = await QRCode.toDataURL(token, {
            width: 256,
            margin: 2,
        });
        return { qrDataUrl, expiresAt: exp };
    }
}
