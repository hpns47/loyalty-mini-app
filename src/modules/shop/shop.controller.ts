import {
    Controller,
    Get,
    Param,
    UseGuards,
    InternalServerErrorException,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { TelegramAuthGuard } from "../../infrastructure/guards/telegram-auth.guard";
import { AdminAuthGuard } from "../../infrastructure/guards/admin-auth.guard";
import { ShopService } from "./shop.service";
import { QrService } from "../qr/qr.service";
import { ApiGetShops, ApiGetShopQr } from "./swagger/api-shop.decorator";

@ApiTags("Shops")
@Controller("api/v1/shops")
export class ShopController {
    constructor(
        private readonly shopService: ShopService,
        private readonly qrService: QrService,
    ) {}

    @Get()
    @UseGuards(TelegramAuthGuard)
    @ApiGetShops()
    async getShops() {
        try {
            const shops = await this.shopService.getShops();
            return shops;
        } catch {
            throw new InternalServerErrorException({
                code: "INTERNAL_ERROR",
                message: "Failed to fetch shops",
            });
        }
    }

    @Get(":id/qr")
    @UseGuards(AdminAuthGuard)
    @ApiGetShopQr()
    async getShopQr(@Param("id") shopId: string) {
        try {
            const result = await this.qrService.generateShopQr(shopId);
            return result;
        } catch {
            throw new InternalServerErrorException({
                code: "INTERNAL_ERROR",
                message: "Failed to generate QR",
            });
        }
    }
}
