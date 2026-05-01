import { Injectable, Logger } from "@nestjs/common";
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
import { AntiFraudService } from "../anti-fraud/anti-fraud.service";
import { LoyaltyCard } from "../loyalty-card/entities/loyalty-card.entity";
import { CoffeeShop } from "../shop/entities/coffee-shop.entity";
import { IStampHistoryItem } from "./interfaces/stamp-history.interface";
import { MetricsService } from "../metrics/metrics.service";

@Injectable()
export class StampService {
  private readonly logger = new Logger(StampService.name);
  private readonly qrSecret: string;

  constructor(
    @InjectModel(Stamp)
    private readonly stampModel: typeof Stamp,
    private readonly shopService: ShopService,
    private readonly userService: UserService,
    private readonly loyaltyCardService: LoyaltyCardService,
    private readonly sequelize: Sequelize,
    private readonly configService: ConfigService,
    private readonly antiFraudService: AntiFraudService,
    private readonly metricsService: MetricsService,
  ) {
    this.qrSecret = this.configService.getOrThrow<string>("qrSecret");
  }

  async redeemStamp(qrToken: string, shopId: string, quantity: number = 1): Promise<IStampResult> {
    this.logger.log(`redeemStamp: start shopId=${shopId} quantity=${quantity}`);

    const shop = await this.shopService.findById(shopId);

    if (!shop) {
      this.logger.warn(`redeemStamp: shop not found shopId=${shopId}`);
      this.metricsService.stampErrors.inc({ code: "SHOP_NOT_FOUND" });
      throw new StampError("SHOP_NOT_FOUND", "Shop not found");
    }

    this.logger.log(`redeemStamp: shop found name=${shop.name} threshold=${shop.stamp_threshold}`);

    if (quantity > shop.stamp_threshold) {
      this.logger.warn(`redeemStamp: quantity=${quantity} exceeds threshold=${shop.stamp_threshold}`);
      this.metricsService.stampErrors.inc({ code: "QUANTITY_EXCEEDS_THRESHOLD" });
      throw new StampError(
        "QUANTITY_EXCEEDS_THRESHOLD",
        "Quantity cannot exceed shop stamp threshold",
      );
    }

    let userId: string;
    try {
      const payload = jwt.verify(qrToken, this.qrSecret, {
        algorithms: ["HS256"],
      }) as { sub: string };
      userId = payload.sub;
      this.logger.log(`redeemStamp: QR token valid userId=${userId}`);
    } catch (err) {
      this.logger.warn(`redeemStamp: QR token verification failed — ${(err as Error).message}`);
      this.metricsService.stampErrors.inc({ code: "QR_TOKEN_INVALID" });
      throw new StampError("QR_TOKEN_INVALID", "Invalid or expired QR token");
    }

    const qrTokenHash = createHash("sha256").update(qrToken).digest("hex");

    const cardId = await this.loyaltyCardService.ensureCard(userId, shopId);
    this.logger.log(`redeemStamp: cardId=${cardId}`);

    const dupeCount = await this.stampModel.count({
      where: { qr_token_hash: qrTokenHash },
    });

    if (dupeCount > 0) {
      this.logger.warn(`redeemStamp: QR token already used hash=${qrTokenHash.slice(0, 12)}...`);
      this.metricsService.stampErrors.inc({ code: "QR_TOKEN_ALREADY_USED" });
      throw new StampError(
        "QR_TOKEN_ALREADY_USED",
        "QR code has already been redeemed",
      );
    }

    const tenSecondsAgo = new Date(Date.now() - 10_000);
    const recentCount = await this.stampModel.count({
      where: {
        card_id: cardId,
        added_at: { [Op.gt]: tenSecondsAgo },
      },
    });

    if (recentCount > 0) {
      this.logger.warn(`redeemStamp: rate limit hit cardId=${cardId} (stamp added within last 10s)`);
      this.metricsService.stampErrors.inc({ code: "STAMP_RATE_LIMIT" });
      throw new StampError(
        "STAMP_RATE_LIMIT",
        "Stamp already added recently, please wait",
      );
    }

    this.logger.log(`redeemStamp: anti-fraud check userId=${userId} shopId=${shopId} quantity=${quantity}`);
    await this.antiFraudService.checkAndRecord(userId, shopId, quantity);

    const result = await this.loyaltyCardService.addStampTransaction(
      cardId,
      qrTokenHash,
      shop.stamp_threshold,
      this.stampModel,
      quantity,
    );

    this.logger.log(`redeemStamp: transaction complete newStampCount=${result.newStampCount} isRewardReady=${result.isRewardReady}`);

    this.metricsService.stampsRedeemed.inc({ shop_slug: shop.slug ?? shop.name });

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
      shopName: s.loyalty_card?.coffee_shop?.name ?? "Unknown",
      addedAt: s.added_at,
      quantity: s.quantity,
    }));
  }
}
