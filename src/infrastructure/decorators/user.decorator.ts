import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { IUserPayload } from "../../interfaces/IUserPayload.interface";
import { IUserRequest } from "../../interfaces/IUserRequest.interface";

/**
 * Декоратор `@User()` извлекает объект авторизованного пользователя из запроса.
 *
 * Используется в контроллерах для упрощённого доступа к данным пользователя,
 * которые были добавлены в `request.user`, например после прохождения `AuthGuard`.
 *
 * @param data - (необязательный) ключ поля из объекта пользователя (`user`), например `"id"` или `"token"`.
 *               Если не указан, возвращается весь объект `user`.
 *
 * @returns Значение указанного поля `user`, либо весь объект `user`, если параметр `data` не указан.
 *
 * @Get('me')
 * getMe(@User() user: User) {
 *   return user;
 * }
 *
 * @Get('me/id')
 * getMyId(@User('id') userId: number) {
 *   return userId;
 * }
 */
export const User = createParamDecorator(
    (data: keyof IUserPayload, ctx: ExecutionContext) => {
        const request: IUserRequest = ctx.switchToHttp().getRequest();

        return data ? request.user[data] : request.user;
    },
);
