import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as jwt from "jsonwebtoken";
import { ICashierPayload } from "../../modules/cashier/interfaces/cashier-payload.interface";
import { ICashierShop } from "../../modules/cashier/interfaces/cashier-shop.interface";

@Injectable()
export class CashierAuthGuard implements CanActivate {
    private readonly jwtSecret: string;

    constructor(private readonly configService: ConfigService) {
        this.jwtSecret = this.configService.getOrThrow<string>("jwtSecret");
    }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const authHeader: string | undefined = request.headers["authorization"];

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
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
        } catch {
            throw new UnauthorizedException({
                code: "UNAUTHORIZED",
                message: "Invalid or expired cashier token",
            });
        }

        if (payload.role !== "cashier") {
            throw new UnauthorizedException({
                code: "UNAUTHORIZED",
                message: "Token is not a cashier token",
            });
        }

        const cashierShop: ICashierShop = {
            shopId: payload.sub,
            shopSlug: payload.shopSlug,
        };

        request.cashierShop = cashierShop;
        return true;
    }
}
