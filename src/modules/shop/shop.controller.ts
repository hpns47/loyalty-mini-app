import {
    Controller,
    Get,
    Param,
    UseGuards,
    InternalServerErrorException,
    NotFoundException,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { TelegramAuthGuard } from "../../infrastructure/guards/telegram-auth.guard";
import { AdminAuthGuard } from "../../infrastructure/guards/admin-auth.guard";
import { ShopService } from "./shop.service";
import { QrService } from "../qr/qr.service";
import { ApiGetShops, ApiGetShopQr, ApiGetShopQrBySlug } from "./swagger/api-shop.decorator";

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

    @Get("slug/:slug/qr")
    @UseGuards(AdminAuthGuard)
    @ApiGetShopQrBySlug()
    async getShopQrBySlug(@Param("slug") slug: string) {
        const shop = await this.shopService.findBySlug(slug);
        if (!shop) {
            throw new NotFoundException({
                code: "SHOP_NOT_FOUND",
                message: "Shop not found",
            });
        }
        try {
            const result = await this.qrService.generateShopQr(shop.id);
            return result;
        } catch {
            throw new InternalServerErrorException({
                code: "INTERNAL_ERROR",
                message: "Failed to generate QR",
            });
        }
    }
}
