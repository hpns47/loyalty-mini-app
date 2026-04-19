import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHmac, timingSafeEqual } from "crypto";
import { ITelegramUser } from "../../modules/auth/interfaces/telegram-user.interface";

@Injectable()
export class TelegramAuthGuard implements CanActivate {
    private readonly secretKey: Buffer;
    private readonly nodeEnv: string;

    constructor(private readonly configService: ConfigService) {
        const botToken = this.configService.get<string>("botToken");
        this.nodeEnv = this.configService.get<string>("nodeEnv", "development");
        this.secretKey = createHmac("sha256", "WebAppData")
            .update(botToken)
            .digest();
    }

    private static readonly MAX_AUTH_AGE_SECONDS = 24 * 60 * 60;

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const initDataRaw: string | undefined =
            request.headers["x-telegram-init-data"];

        if (!initDataRaw) {
            throw new UnauthorizedException({
                code: "UNAUTHORIZED",
                message: "Missing X-Telegram-Init-Data header",
            });
        }

        // Dev bypass
        if (
            this.nodeEnv === "development" &&
            initDataRaw.startsWith("mock")
        ) {
            let devUser: ITelegramUser = {
                id: 123456789,
                first_name: "Alisher",
                username: "alisher_dev",
            };

            if (initDataRaw.startsWith("mock:")) {
                try {
                    const parsed = JSON.parse(initDataRaw.slice(5));
                    if (parsed && typeof parsed.id === "number") {
                        devUser = {
                            id: parsed.id,
                            first_name: parsed.first_name ?? "Dev",
                            username: parsed.username ?? "unknown",
                            last_name: parsed.last_name,
                            language_code: parsed.language_code,
                            is_premium: parsed.is_premium,
                            photo_url: parsed.photo_url,
                        };
                    }
                } catch {
                    /* fall through to default user */
                }
            }

            request.telegramUser = devUser;
            return true;
        }

        const params = new URLSearchParams(initDataRaw);
        const receivedHash = params.get("hash");

        if (!receivedHash) {
            throw new UnauthorizedException({
                code: "UNAUTHORIZED",
                message: "Missing hash in initData",
            });
        }

        params.delete("hash");

        const checkString = [...params.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => `${k}=${v}`)
            .join("\n");

        const expectedHash = createHmac("sha256", this.secretKey)
            .update(checkString)
            .digest("hex");

        const receivedBuf = Buffer.from(receivedHash, "hex");
        const expectedBuf = Buffer.from(expectedHash, "hex");

        if (
            receivedBuf.length !== expectedBuf.length ||
            !timingSafeEqual(receivedBuf, expectedBuf)
        ) {
            throw new UnauthorizedException({
                code: "UNAUTHORIZED",
                message: "Invalid initData signature",
            });
        }

        const authDate = parseInt(params.get("auth_date") ?? "", 10);
        const ageSeconds = Math.floor(Date.now() / 1000) - authDate;

        if (
            isNaN(authDate) ||
            ageSeconds < 0 ||
            ageSeconds > TelegramAuthGuard.MAX_AUTH_AGE_SECONDS
        ) {
            throw new UnauthorizedException({
                code: "UNAUTHORIZED",
                message: "initData expired",
            });
        }

        const userRaw = params.get("user");
        if (!userRaw) {
            throw new UnauthorizedException({
                code: "UNAUTHORIZED",
                message: "Missing user in initData",
            });
        }

        let parsed: any;
        try {
            parsed = JSON.parse(userRaw);
        } catch {
            throw new UnauthorizedException({
                code: "UNAUTHORIZED",
                message: "Invalid user JSON in initData",
            });
        }

        if (!parsed || typeof parsed.id !== "number") {
            throw new UnauthorizedException({
                code: "UNAUTHORIZED",
                message: "Invalid user data in initData",
            });
        }

        const telegramUser: ITelegramUser = {
            id: parsed.id,
            first_name: parsed.first_name,
            last_name: parsed.last_name,
            username: parsed.username,
            language_code: parsed.language_code,
            is_premium: parsed.is_premium,
            photo_url: parsed.photo_url,
        };

        request.telegramUser = telegramUser;
        return true;
    }
}
