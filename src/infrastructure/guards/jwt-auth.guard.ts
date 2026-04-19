import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { JwtService } from "@nestjs/jwt";
import * as process from "process";
import { IUserRequest } from "../../interfaces/IUserRequest.interface";

/**
 * Guard `JwtAuthGuard` используется для защиты маршрутов с помощью проверки JWT токена.
 *
 * Этот guard перехватывает входящий HTTP-запрос, извлекает токен из заголовка `authorization`,
 * проверяет его с использованием `JwtService`, и если токен валиден — добавляет пользователя в `req.user`.
 *
 * Если токен отсутствует, некорректен или не начинается с `Bearer`, выбрасывается `UnauthorizedException`.
 *
 * Используется в сочетании с декоратором `@UseGuards()` в контроллерах или маршрутах, чтобы требовать авторизацию.
 *
 * @UseGuards(JwtAuthGuard)
 * @Get('profile')
 * getProfile(@User() user: IUserPayload) {
 *   return user;
 * }
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const req: IUserRequest = context.switchToHttp().getRequest();
        const authHeader: string | null = req.headers.get("authorization");

        if (authHeader) {
            const bearer = authHeader.split(" ")[0];
            const token = authHeader.split(" ")[1];

            if (bearer !== "Bearer" || !token) {
                throw new UnauthorizedException({
                    message: "Необходима авторизация",
                });
            }

            req.user = this.jwtService.verify(token, {
                secret: process.env.JWT_SECRET,
            });

            return true;
        }

        throw new UnauthorizedException({
            message: "Необходима авторизация",
        });
    }
}
