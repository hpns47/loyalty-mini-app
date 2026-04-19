import { Module } from "@nestjs/common";
import { RewardController } from "./reward.controller";
import { RewardService } from "./reward.service";
import { ShopModule } from "../shop/shop.module";
import { LoyaltyCardModule } from "../loyalty-card/loyalty-card.module";

@Module({
    imports: [ShopModule, LoyaltyCardModule],
    controllers: [RewardController],
    providers: [RewardService],
})
export class RewardModule {}
