import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { ConfigService } from "@nestjs/config";
import { ShopService } from "../shop/shop.service";
import { UserService } from "../user/user.service";
import { UserRole, UserRoleEnum } from "../role-management/entities/user-role.entity";
import { ICashierLoginResponse } from "./interfaces/cashier-login.interface";
import { ICashierValidateResponse } from "./interfaces/cashier-validate.interface";
import { ICashierPayload } from "./interfaces/cashier-payload.interface";

@Injectable()
export class CashierService {
    private readonly logger = new Logger(CashierService.name);
    private readonly jwtSecret: string;

    constructor(
        private readonly shopService: ShopService,
        private readonly userService: UserService,
        @InjectModel(UserRole)
        private readonly userRoleModel: typeof UserRole,
        private readonly configService: ConfigService,
    ) {
        this.jwtSecret = this.configService.getOrThrow<string>("jwtSecret");
    }

    async login(
        shopSlug: string,
        cashierKey: string,
        username?: string,
    ): Promise<ICashierLoginResponse> {
        const displayUsername = username?.trim() ? `"@${username.trim().replace(/^@/, "")}"` : "(not provided)";
        this.logger.log(`cashier login: attempt — slug="${shopSlug}" username=${displayUsername}`);

        const shop = await this.shopService.findBySlug(shopSlug);

        if (!shop) {
            this.logger.warn(`cashier login: shop not found — slug="${shopSlug}"`);
            throw new UnauthorizedException({
                code: "SHOP_NOT_FOUND",
                message: "Shop not found",
            });
        }

        this.logger.log(`cashier login: shop resolved — shopId=${shop.id} slug="${shopSlug}"`);

        const keyValid = await bcrypt.compare(cashierKey, shop.cashier_key_hash);

        if (!keyValid) {
            this.logger.warn(
                `cashier login: invalid cashier key — shopId=${shop.id} username=${displayUsername}`,
            );
            throw new UnauthorizedException({
                code: "INVALID_CASHIER_KEY",
                message: "Invalid cashier key",
            });
        }

        this.logger.log(`cashier login: cashier key verified — shopId=${shop.id}`);

        let userId: string | undefined;

        if (username && username.trim().length > 0) {
            const cleanUsername = username.trim().replace(/^@/, "");

            const user = await this.userService.findByUsername(cleanUsername);

            if (!user) {
                this.logger.warn(
                    `cashier login: username "@${cleanUsername}" not found in DB — ` +
                    `user may not have opened the loyalty app yet, or their Telegram account has no @username set. ` +
                    `Granting key-only access to shopId=${shop.id} — audit trail incomplete.`,
                );
            } else {
                this.logger.log(
                    `cashier login: user resolved — userId=${user.id} username="@${cleanUsername}" firstName="${user.first_name}"`,
                );

                const role = await this.userRoleModel.findOne({
                    where: {
                        user_id: user.id,
                        shop_id: shop.id,
                        role: UserRoleEnum.CASHIER,
                    },
                    attributes: ["id"],
                });

                if (!role) {
                    this.logger.warn(
                        `cashier login: ACCESS DENIED — userId=${user.id} username="@${cleanUsername}" ` +
                        `does not have the cashier role for shopId=${shop.id}`,
                    );
                    throw new UnauthorizedException({
                        code: "NOT_AUTHORIZED",
                        message: "User is not authorized as cashier for this shop",
                    });
                }

                userId = user.id;
                this.logger.log(
                    `cashier login: cashier role confirmed — userId=${userId} username="@${cleanUsername}" shopId=${shop.id}`,
                );
            }
        } else {
            this.logger.warn(
                `cashier login: no username provided — granting key-only access to shopId=${shop.id}. ` +
                `Expected only for Telegram accounts without a @username.`,
            );
        }

        const payload: ICashierPayload = {
            sub: shop.id,
            shopSlug,
            role: "cashier",
            ...(userId ? { userId } : {}),
        };

        const accessToken = jwt.sign(payload, this.jwtSecret, {
            expiresIn: "8h",
            algorithm: "HS256",
        });

        this.logger.log(
            `cashier login: JWT issued — shopId=${shop.id} userId=${userId ?? "anonymous"} expiresIn=8h`,
        );

        return { accessToken };
    }

    async validate(shopSlug: string, cashierKey: string): Promise<ICashierValidateResponse> {
        const shop = await this.shopService.findBySlug(shopSlug);
        if (!shop) return { valid: false, shopId: "" };
        const valid = await bcrypt.compare(cashierKey, shop.cashier_key_hash);
        return { valid, shopId: valid ? shop.id : "" };
    }
}
