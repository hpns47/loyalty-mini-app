import {
    Controller,
    Post,
    UseGuards,
    InternalServerErrorException,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { TelegramAuthGuard } from "../../infrastructure/guards/telegram-auth.guard";
import { TelegramUser } from "../../infrastructure/decorators/telegram-user.decorator";
import { ITelegramUser } from "./interfaces/telegram-user.interface";
import { UserService } from "../user/user.service";
import { ApiMe } from "./swagger/api-auth.decorator";

@ApiTags("Auth")
@Controller("api/v1/auth")
export class AuthController {
    constructor(private readonly userService: UserService) {}

    @Post("me")
    @UseGuards(TelegramAuthGuard)
    @ApiMe()
    async me(@TelegramUser() telegramUser: ITelegramUser) {
        try {
            const user = await this.userService.upsertUser(telegramUser);
            return { user };
        } catch {
            throw new InternalServerErrorException({
                code: "AUTH_FAILED",
                message: "Authentication failed",
            });
        }
    }
}
