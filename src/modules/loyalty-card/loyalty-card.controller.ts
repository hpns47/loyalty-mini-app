import {
    Controller,
    Get,
    Patch,
    Param,
    UseGuards,
    InternalServerErrorException,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { TelegramAuthGuard } from "../../infrastructure/guards/telegram-auth.guard";
import { TelegramUser } from "../../infrastructure/decorators/telegram-user.decorator";
import { ITelegramUser } from "../auth/interfaces/telegram-user.interface";
import { LoyaltyCardService } from "./loyalty-card.service";
import { UserService } from "../user/user.service";
import { ApiGetCards, ApiGetOrCreateCard, ApiHideCard, ApiShowCard } from "./swagger/api-loyalty-card.decorator";

@ApiTags("Cards")
@Controller("api/v1/cards")
@UseGuards(TelegramAuthGuard)
export class LoyaltyCardController {
    constructor(
        private readonly loyaltyCardService: LoyaltyCardService,
        private readonly userService: UserService,
    ) {}

    @Get()
    @ApiGetCards()
    async getCards(@TelegramUser() telegramUser: ITelegramUser) {
        try {
            const userId = await this.userService.getUserIdByTelegramId(
                telegramUser.id,
            );
            const cards = await this.loyaltyCardService.getCards(userId);
            return { cards };
        } catch {
            throw new InternalServerErrorException({
                code: "INTERNAL_ERROR",
                message: "Failed to fetch cards",
            });
        }
    }

    @Patch(":shopId/hide")
    @ApiHideCard()
    async hideCard(
        @TelegramUser() telegramUser: ITelegramUser,
        @Param("shopId") shopId: string,
    ) {
        try {
            const userId = await this.userService.getUserIdByTelegramId(telegramUser.id);
            await this.loyaltyCardService.hideCard(userId, shopId);
            return { success: true };
        } catch {
            throw new InternalServerErrorException({ code: "INTERNAL_ERROR", message: "Failed to hide card" });
        }
    }

    @Patch(":shopId/show")
    @ApiShowCard()
    async showCard(
        @TelegramUser() telegramUser: ITelegramUser,
        @Param("shopId") shopId: string,
    ) {
        try {
            const userId = await this.userService.getUserIdByTelegramId(telegramUser.id);
            await this.loyaltyCardService.showCard(userId, shopId);
            return { success: true };
        } catch {
            throw new InternalServerErrorException({ code: "INTERNAL_ERROR", message: "Failed to show card" });
        }
    }

    @Get(":shopId")
    @ApiGetOrCreateCard()
    async getOrCreateCard(
        @TelegramUser() telegramUser: ITelegramUser,
        @Param("shopId") shopId: string,
    ) {
        try {
            const userId = await this.userService.getUserIdByTelegramId(
                telegramUser.id,
            );
            const card = await this.loyaltyCardService.getOrCreateCard(
                userId,
                shopId,
            );
            return { card };
        } catch {
            throw new InternalServerErrorException({
                code: "INTERNAL_ERROR",
                message: "Failed to get card",
            });
        }
    }
}
