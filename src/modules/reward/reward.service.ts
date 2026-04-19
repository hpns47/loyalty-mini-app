import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { ShopService } from "../shop/shop.service";
import { LoyaltyCardService } from "../loyalty-card/loyalty-card.service";

@Injectable()
export class RewardService {
    constructor(
        private readonly shopService: ShopService,
        private readonly loyaltyCardService: LoyaltyCardService,
    ) {}

    async redeem(
        userId: string,
        shopId: string,
        cashierKey: string,
    ): Promise<{ success: boolean }> {
        // Validate shop
        const shop = await this.shopService.findById(shopId);
        if (!shop) {
            throw new NotFoundException({
                code: "SHOP_NOT_FOUND",
                message: "Shop not found",
            });
        }

        // Validate cashier key
        const keyValid = await bcrypt.compare(
            cashierKey,
            shop.cashier_key_hash,
        );
        if (!keyValid) {
            throw new UnauthorizedException({
                code: "INVALID_CASHIER_KEY",
                message: "Invalid cashier key",
            });
        }

        // Find reward-ready card
        const cardId = await this.loyaltyCardService.findRewardReadyCard(
            userId,
            shopId,
        );
        if (!cardId) {
            throw new NotFoundException({
                code: "NO_REWARD_READY",
                message: "No reward-ready card found",
            });
        }

        // Reset the card
        await this.loyaltyCardService.resetCard(cardId);

        return { success: true };
    }
}
