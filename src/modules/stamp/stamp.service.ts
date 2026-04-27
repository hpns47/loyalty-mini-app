import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { ConfigService } from "@nestjs/config";
import { Sequelize } from "sequelize-typescript";
import { createHash } from "crypto";
import * as jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { Stamp } from "./entities/stamp.entity";
import { StampError } from "./interfaces/stamp-error";
import { IStampResult } from "./interfaces/stamp-result.interface";
import { ShopService } from "../shop/shop.service";
import { UserService } from "../user/user.service";
import { LoyaltyCardService } from "../loyalty-card/loyalty-card.service";
import { LoyaltyCard } from "../loyalty-card/entities/loyalty-card.entity";
import { CoffeeShop } from "../shop/entities/coffee-shop.entity";
import { IStampHistoryItem } from "./interfaces/stamp-history.interface";

@Injectable()
export class StampService {
    private readonly qrSecret: string;

    constructor(
        @InjectModel(Stamp)
        private readonly stampModel: typeof Stamp,
        private readonly shopService: ShopService,
        private readonly userService: UserService,
        private readonly loyaltyCardService: LoyaltyCardService,
        private readonly sequelize: Sequelize,
        private readonly configService: ConfigService,
    ) {
        this.qrSecret = this.configService.getOrThrow<string>("qrSecret");
    }

    async redeemStamp(
        qrToken: string,
        shopId: string,
    ): Promise<IStampResult> {
        // 1. Fetch shop via ShopService
        const shop = await this.shopService.findById(shopId);

        if (!shop) {
            throw new StampError("SHOP_NOT_FOUND", "Shop not found");
        }

        // 2. Verify user QR JWT
        let userId: string;
        try {
            const payload = jwt.verify(qrToken, this.qrSecret, {
                algorithms: ["HS256"],
            }) as { sub: string };
            userId = payload.sub;
        } catch {
            throw new StampError(
                "QR_TOKEN_INVALID",
                "Invalid or expired QR token",
            );
        }

        // 4. Hash token
        const qrTokenHash = createHash("sha256")
            .update(qrToken)
            .digest("hex");

        // 5. Ensure loyalty card exists via LoyaltyCardService
        const cardId = await this.loyaltyCardService.ensureCard(
            userId,
            shopId,
        );

        // 6. Check duplicate token
        const dupeCount = await this.stampModel.count({
            where: { qr_token_hash: qrTokenHash },
        });

        if (dupeCount > 0) {
            throw new StampError(
                "QR_TOKEN_ALREADY_USED",
                "QR code has already been redeemed",
            );
        }

        // 7. Rate limit — 10 seconds
        const tenSecondsAgo = new Date(Date.now() - 10_000);
        const recentCount = await this.stampModel.count({
            where: {
                card_id: cardId,
                added_at: { [Op.gt]: tenSecondsAgo },
            },
        });

        if (recentCount > 0) {
            throw new StampError(
                "STAMP_RATE_LIMIT",
                "Stamp already added recently, please wait",
            );
        }

        // 8+9. Atomic: insert stamp + increment card via LoyaltyCardService
        const result =
            await this.loyaltyCardService.addStampTransaction(
                cardId,
                qrTokenHash,
                shop.stamp_threshold,
                this.stampModel,
            );

        // 10. Fetch user name via UserService
        const userName = await this.userService.getFirstName(userId);

        return {
            cardId,
            newStampCount: result.newStampCount,
            isRewardReady: result.isRewardReady,
            userName,
            stampThreshold: shop.stamp_threshold,
        };
    }

    async getUserHistory(userId: string): Promise<IStampHistoryItem[]> {
        const stamps = await this.stampModel.findAll({
            include: [
                {
                    model: LoyaltyCard,
                    required: true,
                    where: { user_id: userId },
                    attributes: [],
                    include: [
                        {
                            model: CoffeeShop,
                            attributes: ["name"],
                        },
                    ],
                },
            ],
            order: [["added_at", "DESC"]],
            limit: 50,
        });

        return stamps.map((s) => ({
            shopName: s.loyalty_card.coffee_shop.name,
            addedAt: s.added_at,
        }));
    }
}
