import {
    Controller,
    Post,
    Get,
    Body,
    HttpException,
    InternalServerErrorException,
    UseGuards,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiTags } from "@nestjs/swagger";
import { StampService } from "./stamp.service";
import { RedeemStampDto } from "./dto/redeem-stamp.dto";
import { StampError } from "./interfaces/stamp-error";
import { ApiRedeemStamp, ApiGetStampHistory } from "./swagger/api-stamp.decorator";
import { TelegramAuthGuard } from "../../infrastructure/guards/telegram-auth.guard";
import { TelegramUser } from "../../infrastructure/decorators/telegram-user.decorator";
import { ITelegramUser } from "../auth/interfaces/telegram-user.interface";
import { UserService } from "../user/user.service";

@ApiTags("Stamps")
@Controller("api/v1/stamps")
export class StampController {
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
    @ApiRedeemStamp()
    async redeemStamp(@Body() dto: RedeemStampDto) {
        try {
            const result = await this.stampService.redeemStamp(
                dto.qrToken,
                dto.shopId,
                dto.cashierKey,
            );
            return { stamp: result };
        } catch (err) {
            if (err instanceof StampError) {
                const statusMap: Record<string, number> = {
                    SHOP_NOT_FOUND: 404,
                    INVALID_CASHIER_KEY: 401,
                    QR_TOKEN_INVALID: 401,
                    QR_TOKEN_ALREADY_USED: 409,
                    STAMP_RATE_LIMIT: 429,
                };
                const status = statusMap[err.code] ?? 500;
                throw new HttpException(
                    { error: { code: err.code, message: err.message } },
                    status,
                );
            }
            throw new InternalServerErrorException({
                code: "INTERNAL_ERROR",
                message: "Failed to redeem stamp",
            });
        }
    }
}
