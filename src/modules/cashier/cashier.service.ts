import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { ConfigService } from "@nestjs/config";
import { ShopService } from "../shop/shop.service";
import { ICashierLoginResponse } from "./interfaces/cashier-login.interface";
import { ICashierValidateResponse } from "./interfaces/cashier-validate.interface";

@Injectable()
export class CashierService {
    private readonly jwtSecret: string;

    constructor(
        private readonly shopService: ShopService,
        private readonly configService: ConfigService,
    ) {
        this.jwtSecret = this.configService.getOrThrow<string>("jwtSecret");
    }

    async login(
        shopSlug: string,
        cashierKey: string,
    ): Promise<ICashierLoginResponse> {
        const shop = await this.shopService.findBySlug(shopSlug);

        if (!shop) {
            throw new UnauthorizedException({
                code: "SHOP_NOT_FOUND",
                message: "Shop not found",
            });
        }

        const valid = await bcrypt.compare(cashierKey, shop.cashier_key_hash);

        if (!valid) {
            throw new UnauthorizedException({
                code: "INVALID_CASHIER_KEY",
                message: "Invalid cashier key",
            });
        }

        const payload = { sub: shop.id, shopSlug, role: "cashier" };
        const accessToken = jwt.sign(payload, this.jwtSecret, {
            expiresIn: "8h",
            algorithm: "HS256",
        });

        return { accessToken };
    }

    async validate(
        shopSlug: string,
        cashierKey: string,
    ): Promise<ICashierValidateResponse> {
        const shop = await this.shopService.findBySlug(shopSlug);

        if (!shop) {
            return { valid: false, shopId: "" };
        }

        const valid = await bcrypt.compare(cashierKey, shop.cashier_key_hash);
        return { valid, shopId: valid ? shop.id : "" };
    }
}
