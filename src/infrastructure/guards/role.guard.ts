import {
    CanActivate,
    ExecutionContext,
    Injectable,
    HttpException,
    HttpStatus,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { UserRoleEnum } from "../../modules/role-management/entities/user-role.entity";
import { RoleManagementService } from "../../modules/role-management/role-management.service";
import { ITelegramUser } from "../../modules/auth/interfaces/telegram-user.interface";

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly roleManagementService: RoleManagementService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.get<UserRoleEnum[]>(
            ROLES_KEY,
            context.getHandler(),
        );

        if (!requiredRoles?.length) return true;

        const request = context.switchToHttp().getRequest();
        const telegramUser: ITelegramUser | undefined = request.telegramUser;

        if (!telegramUser) {
            throw new HttpException(
                { error: { code: "FORBIDDEN", message: "Authentication required" } },
                HttpStatus.FORBIDDEN,
            );
        }

        const shopId =
            request.params?.shopId ??
            request.params?.id ??
            request.query?.shopId;

        if (!shopId) {
            throw new HttpException(
                { error: { code: "SHOP_ID_REQUIRED", message: "shopId is required" } },
                HttpStatus.BAD_REQUEST,
            );
        }

        const userRole = await this.roleManagementService.getUserRoleForShop(
            telegramUser.id,
            shopId,
        );

        if (!userRole || !requiredRoles.includes(userRole)) {
            throw new HttpException(
                { error: { code: "FORBIDDEN", message: "Insufficient role for this shop" } },
                HttpStatus.FORBIDDEN,
            );
        }

        return true;
    }
}
