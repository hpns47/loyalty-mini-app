import {
    Injectable,
    NotFoundException,
} from "@nestjs/common";
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
    ): Promise<{ success: boolean }> {
        const shop = await this.shopService.findById(shopId);
        if (!shop) {
            throw new NotFoundException({
                code: "SHOP_NOT_FOUND",
                message: "Shop not found",
            });
        }

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

        await this.loyaltyCardService.resetCard(cardId);

        return { success: true };
    }
}
