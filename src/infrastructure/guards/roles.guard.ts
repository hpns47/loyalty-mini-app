import {
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { JwtService } from "@nestjs/jwt";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/auth.decorator";
import * as process from "process";
import { IUserPayload } from "../../interfaces/IUserPayload.interface";
import { IUserRole } from "../../interfaces/IUserRole.interface";
import { IUserRequest } from "../../interfaces/IUserRequest.interface";

/**
 * Guard `RolesGuard` используется для ограничения доступа к маршрутам на основе ролей пользователя.
 *
 * Он извлекает JWT-токен из заголовка `Authorization`, декодирует его с помощью `JwtService`,
 * и проверяет, содержит ли пользователь хотя бы одну из ролей, требуемых для маршрута.
 *
 * Список необходимых ролей указывается через декоратор `@Roles()` и сохраняется в метаданных
 * с помощью `Reflector`.
 *
 * Если роли не требуются (`@Roles()` не задан), доступ разрешается.
 * Если токен отсутствует, недействителен или не содержит нужных ролей — выбрасывается исключение.
 *
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('admin')
 * @Get('admin-data')
 * getAdminData() {
 *   return { message: 'Только для админов' };
 * }
 */

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private reflector: Reflector,
    ) {}

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const req: IUserRequest = context.switchToHttp().getRequest();

        const requiredRoles: string[] = this.reflector.getAllAndOverride(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredRoles) {
            return true;
        }

        const authHeader: string | null = req.headers.get("authorization");

        if (authHeader) {
            const bearer = authHeader.split(" ")[0];
            const token = authHeader.split(" ")[1];

            if (bearer !== "Bearer" || !token) {
                throw new UnauthorizedException({
                    message: "Необходима авторизация",
                });
            }

            let user: IUserPayload;

            try {
                user = this.jwtService.verify<IUserPayload>(token, {
                    secret: process.env.JWT_SECRET,
                });
            } catch (err) {
                throw new UnauthorizedException(err);
            }

            if (user) {
                const isHaveRoles: boolean = user.roles.some(
                    (role: IUserRole) => requiredRoles.includes(role.code),
                );
                if (isHaveRoles) return true;
            }
        }

        throw new HttpException(
            "Нет прав для использования этого метода",
            HttpStatus.FORBIDDEN,
        );
    }
}
