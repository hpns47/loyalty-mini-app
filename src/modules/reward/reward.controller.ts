import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { RewardService } from "./reward.service";
import { RedeemRewardDto } from "./dto/redeem-reward.dto";
import { ApiRedeemReward } from "./swagger/api-reward.decorator";
import { CashierAuthGuard } from "../../infrastructure/guards/cashier-auth.guard";
import { CashierShop } from "../../infrastructure/decorators/cashier-shop.decorator";
import { ICashierShop } from "../cashier/interfaces/cashier-shop.interface";

@ApiTags("Rewards")
@Controller("api/v1/rewards")
export class RewardController {
    constructor(private readonly rewardService: RewardService) {}

    @Post("redeem")
    @UseGuards(CashierAuthGuard)
    @ApiRedeemReward()
    async redeem(
        @Body() dto: RedeemRewardDto,
        @CashierShop() cashierShop: ICashierShop,
    ) {
        return this.rewardService.redeem(dto.userId, cashierShop.shopId);
    }
}
