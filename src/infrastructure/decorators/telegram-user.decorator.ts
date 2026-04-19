import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { ITelegramUser } from "../../modules/auth/interfaces/telegram-user.interface";

export const TelegramUser = createParamDecorator(
    (data: keyof ITelegramUser | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user: ITelegramUser = request.telegramUser;
        return data ? user?.[data] : user;
    },
);
