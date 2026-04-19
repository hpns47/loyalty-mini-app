import {
    Controller,
    Get,
    UseGuards,
    InternalServerErrorException,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { TelegramAuthGuard } from "../../infrastructure/guards/telegram-auth.guard";
import { TelegramUser } from "../../infrastructure/decorators/telegram-user.decorator";
import { ITelegramUser } from "../auth/interfaces/telegram-user.interface";
import { UserService } from "./user.service";
import { QrService } from "../qr/qr.service";
import { ApiGetUserQr } from "./swagger/api-user.decorator";

@ApiTags("User")
@Controller("api/v1/user")
@UseGuards(TelegramAuthGuard)
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly qrService: QrService,
    ) {}

    @Get("qr")
    @ApiGetUserQr()
    async getUserQr(@TelegramUser() telegramUser: ITelegramUser) {
        try {
            const userId = await this.userService.getUserIdByTelegramId(
                telegramUser.id,
            );
            const qr = await this.qrService.generateUserQr(userId);
            return qr;
        } catch {
            throw new InternalServerErrorException({
                code: "INTERNAL_ERROR",
                message: "Failed to generate QR code",
            });
        }
    }
}
