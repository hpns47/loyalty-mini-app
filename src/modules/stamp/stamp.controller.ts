import {
    Controller,
    Post,
    Body,
    HttpException,
    InternalServerErrorException,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { StampService } from "./stamp.service";
import { RedeemStampDto } from "./dto/redeem-stamp.dto";
import { StampError } from "./interfaces/stamp-error";
import { ApiRedeemStamp } from "./swagger/api-stamp.decorator";

@ApiTags("Stamps")
@Controller("api/v1/stamps")
export class StampController {
    constructor(private readonly stampService: StampService) {}

    @Post("redeem")
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
