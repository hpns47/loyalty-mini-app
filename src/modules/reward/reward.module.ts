import { Module } from "@nestjs/common";
import { RewardController } from "./reward.controller";
import { RewardService } from "./reward.service";
import { ShopModule } from "../shop/shop.module";
import { LoyaltyCardModule } from "../loyalty-card/loyalty-card.module";
import { MetricsModule } from "../metrics/metrics.module";

@Module({
    imports: [ShopModule, LoyaltyCardModule, MetricsModule],
    controllers: [RewardController],
    providers: [RewardService],
})
export class RewardModule {}
