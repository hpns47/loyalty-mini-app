import {
    Controller,
    Get,
    Patch,
    Body,
    UseGuards,
    InternalServerErrorException,
    HttpException,
    ForbiddenException,
    NotFoundException,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { TelegramAuthGuard } from "../../infrastructure/guards/telegram-auth.guard";
import { TelegramUser } from "../../infrastructure/decorators/telegram-user.decorator";
import { ITelegramUser } from "../auth/interfaces/telegram-user.interface";
import { UserService } from "./user.service";
import { QrService } from "../qr/qr.service";
import { SetBirthdayDto } from "./dto/set-birthday.dto";
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

    @Patch("birthday")
    async setBirthday(
        @TelegramUser() telegramUser: ITelegramUser,
        @Body() dto: SetBirthdayDto,
    ) {
        try {
            const userId = await this.userService.getUserIdByTelegramId(telegramUser.id);
            await this.userService.setBirthday(userId, dto.birthday);
            return { ok: true };
        } catch (err) {
            if (err instanceof ForbiddenException) {
                throw new HttpException(
                    { error: { code: "BIRTHDAY_ALREADY_SET", message: "Birthday can only be set once" } },
                    403,
                );
            }
            if (err instanceof NotFoundException) {
                throw new HttpException(
                    { error: { code: "USER_NOT_FOUND", message: "User not found" } },
                    404,
                );
            }
            throw new InternalServerErrorException({
                code: "INTERNAL_ERROR",
                message: "Failed to set birthday",
            });
        }
    }
}
