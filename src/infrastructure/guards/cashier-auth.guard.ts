import {
    CanActivate,
    ExecutionContext,
    Injectable,
    Logger,
    UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as jwt from "jsonwebtoken";
import { ICashierPayload } from "../../modules/cashier/interfaces/cashier-payload.interface";
import { ICashierShop } from "../../modules/cashier/interfaces/cashier-shop.interface";

@Injectable()
export class CashierAuthGuard implements CanActivate {
    private readonly logger = new Logger(CashierAuthGuard.name);
    private readonly jwtSecret: string;

    constructor(private readonly configService: ConfigService) {
        this.jwtSecret = this.configService.getOrThrow<string>("jwtSecret");
    }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const authHeader: string | undefined = request.headers["authorization"];

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            this.logger.warn("CashierAuthGuard: missing or malformed Authorization header");
            throw new UnauthorizedException({
                code: "UNAUTHORIZED",
                message: "Missing or invalid Authorization header",
            });
        }

        const token = authHeader.slice(7);

        let payload: ICashierPayload;
        try {
            payload = jwt.verify(token, this.jwtSecret, {
                algorithms: ["HS256"],
            }) as ICashierPayload;
        } catch (err) {
            this.logger.warn(`CashierAuthGuard: JWT verification failed — ${(err as Error).message}`);
            throw new UnauthorizedException({
                code: "UNAUTHORIZED",
                message: "Invalid or expired cashier token",
            });
        }

        if (payload.role !== "cashier") {
            this.logger.warn(`CashierAuthGuard: token role is '${payload.role}', expected 'cashier'`);
            throw new UnauthorizedException({
                code: "UNAUTHORIZED",
                message: "Token is not a cashier token",
            });
        }

        const cashierShop: ICashierShop = {
            shopId: payload.sub,
            shopSlug: payload.shopSlug,
            ...(payload.userId ? { userId: payload.userId } : {}),
        };

        this.logger.log(
            `CashierAuthGuard: authenticated — shopId=${cashierShop.shopId} slug="${cashierShop.shopSlug}" userId=${cashierShop.userId ?? "anonymous"}`,
        );
        request.cashierShop = cashierShop;
        return true;
    }
}
