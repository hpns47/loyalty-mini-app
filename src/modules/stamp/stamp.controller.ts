import {
    Controller,
    Post,
    Get,
    Body,
    HttpException,
    InternalServerErrorException,
    Logger,
    UseGuards,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiTags } from "@nestjs/swagger";
import { StampService } from "./stamp.service";
import { RedeemStampDto } from "./dto/redeem-stamp.dto";
import { StampError } from "./interfaces/stamp-error";
import { ApiRedeemStamp, ApiGetStampHistory } from "./swagger/api-stamp.decorator";
import { TelegramAuthGuard } from "../../infrastructure/guards/telegram-auth.guard";
import { CashierAuthGuard } from "../../infrastructure/guards/cashier-auth.guard";
import { TelegramUser } from "../../infrastructure/decorators/telegram-user.decorator";
import { CashierShop } from "../../infrastructure/decorators/cashier-shop.decorator";
import { ITelegramUser } from "../auth/interfaces/telegram-user.interface";
import { ICashierShop } from "../cashier/interfaces/cashier-shop.interface";
import { UserService } from "../user/user.service";

@ApiTags("Stamps")
@Controller("api/v1/stamps")
export class StampController {
    private readonly logger = new Logger(StampController.name);

    constructor(
        private readonly stampService: StampService,
        private readonly userService: UserService,
    ) {}

    @Get("history")
    @UseGuards(TelegramAuthGuard)
    @ApiGetStampHistory()
    async getHistory(@TelegramUser() telegramUser: ITelegramUser) {
        try {
            const userId = await this.userService.getUserIdByTelegramId(
                telegramUser.id,
            );
            const history = await this.stampService.getUserHistory(userId);
            return { history };
        } catch {
            throw new InternalServerErrorException({
                code: "INTERNAL_ERROR",
                message: "Failed to fetch stamp history",
            });
        }
    }

    @Post("redeem")
    @Throttle({ strict: { ttl: 60_000, limit: 10 } })
    @UseGuards(CashierAuthGuard)
    @ApiRedeemStamp()
    async redeemStamp(
        @Body() dto: RedeemStampDto,
        @CashierShop() cashierShop: ICashierShop,
    ) {
        this.logger.log(`redeemStamp: shopId=${cashierShop.shopId} quantity=${dto.quantity ?? 1} qrToken=${dto.qrToken?.slice(0, 20)}...`);
        try {
            const result = await this.stampService.redeemStamp(
                dto.qrToken,
                cashierShop.shopId,
                dto.quantity ?? 1,
                cashierShop.userId,
            );
            this.logger.log(`redeemStamp: success userId=${result.cardId} newStampCount=${result.newStampCount} isRewardReady=${result.isRewardReady}`);
            return { stamp: result };
        } catch (err) {
            if (err instanceof StampError) {
                const statusMap: Record<string, number> = {
                    SHOP_NOT_FOUND: 404,
                    QR_TOKEN_INVALID: 401,
                    QR_TOKEN_ALREADY_USED: 409,
                    STAMP_RATE_LIMIT: 429,
                    QUANTITY_EXCEEDS_THRESHOLD: 422,
                    DAILY_LIMIT_EXCEEDED: 429,
                    SELF_STAMP: 403,
                };
                const status = statusMap[err.code] ?? 500;
                this.logger.warn(`redeemStamp: StampError code=${err.code} status=${status} message=${err.message}`);
                throw new HttpException(
                    { error: { code: err.code, message: err.message } },
                    status,
                );
            }
            this.logger.error(`redeemStamp: unexpected error`, err instanceof Error ? err.stack : String(err));
            throw new InternalServerErrorException({
                code: "INTERNAL_ERROR",
                message: "Failed to redeem stamp",
            });
        }
    }
}
