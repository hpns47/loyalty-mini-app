import { Controller, Post, Body } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { RewardService } from "./reward.service";
import { RedeemRewardDto } from "./dto/redeem-reward.dto";
import { ApiRedeemReward } from "./swagger/api-reward.decorator";

@ApiTags("Rewards")
@Controller("api/v1/rewards")
export class RewardController {
    constructor(private readonly rewardService: RewardService) {}

    @Post("redeem")
    @ApiRedeemReward()
    async redeem(@Body() dto: RedeemRewardDto) {
        return this.rewardService.redeem(
            dto.userId,
            dto.shopId,
            dto.cashierKey,
        );
    }
}
