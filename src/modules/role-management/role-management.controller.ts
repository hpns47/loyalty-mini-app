import {
    Controller,
    Post,
    Delete,
    Get,
    Body,
    Param,
    UseGuards,
    HttpException,
    ForbiddenException,
    NotFoundException,
    InternalServerErrorException,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { RoleManagementService } from "./role-management.service";
import { AssignRoleDto } from "./dto/assign-role.dto";
import { RevokeRoleDto } from "./dto/revoke-role.dto";
import { TelegramAuthGuard } from "../../infrastructure/guards/telegram-auth.guard";
import { AdminAuthGuard } from "../../infrastructure/guards/admin-auth.guard";
import { RoleGuard } from "../../infrastructure/guards/role.guard";
import { TelegramUser } from "../../infrastructure/decorators/telegram-user.decorator";
import { Roles } from "../../infrastructure/decorators/roles.decorator";
import { ITelegramUser } from "../auth/interfaces/telegram-user.interface";
import { UserRoleEnum } from "./entities/user-role.entity";

@ApiTags("Roles")
@Controller("api/v1/roles")
export class RoleManagementController {
    constructor(private readonly roleManagementService: RoleManagementService) {}

    @Post("assign")
    @UseGuards(TelegramAuthGuard)
    async assignRole(
        @TelegramUser() telegramUser: ITelegramUser,
        @Body() dto: AssignRoleDto,
    ) {
        try {
            await this.roleManagementService.assignRole(
                telegramUser.id,
                dto.targetUserId,
                dto.shopId,
                dto.role,
            );
            return { ok: true };
        } catch (err) {
            if (err instanceof ForbiddenException) {
                throw new HttpException(
                    { error: { code: "FORBIDDEN", message: "Only chief can assign roles" } },
                    403,
                );
            }
            if (err instanceof NotFoundException) {
                throw new HttpException(
                    { error: { code: "USER_NOT_FOUND", message: "User not found" } },
                    404,
                );
            }
            throw new InternalServerErrorException({ code: "INTERNAL_ERROR" });
        }
    }

    @Post("admin/assign")
    @UseGuards(AdminAuthGuard)
    async adminAssignRole(@Body() dto: AssignRoleDto) {
        try {
            await this.roleManagementService.adminAssignRole(
                dto.targetUserId,
                dto.shopId,
                dto.role,
            );
            return { ok: true };
        } catch (err) {
            if (err instanceof NotFoundException) {
                throw new HttpException(
                    { error: { code: "USER_NOT_FOUND", message: "User not found" } },
                    404,
                );
            }
            throw new InternalServerErrorException({ code: "INTERNAL_ERROR" });
        }
    }

    @Delete("revoke")
    @UseGuards(TelegramAuthGuard)
    async revokeRole(
        @TelegramUser() telegramUser: ITelegramUser,
        @Body() dto: RevokeRoleDto,
    ) {
        try {
            await this.roleManagementService.revokeRole(
                telegramUser.id,
                dto.targetUserId,
                dto.shopId,
            );
            return { ok: true };
        } catch (err) {
            if (err instanceof ForbiddenException) {
                throw new HttpException(
                    { error: { code: "FORBIDDEN", message: "Only chief can revoke roles" } },
                    403,
                );
            }
            throw new InternalServerErrorException({ code: "INTERNAL_ERROR" });
        }
    }

    @Get("my")
    @UseGuards(TelegramAuthGuard)
    async getMyRoles(@TelegramUser() telegramUser: ITelegramUser) {
        try {
            const roles = await this.roleManagementService.getMyRoles(telegramUser.id);
            return { roles };
        } catch {
            throw new InternalServerErrorException({ code: "INTERNAL_ERROR" });
        }
    }

    @Get("staff/:shopId")
    @UseGuards(TelegramAuthGuard, RoleGuard)
    @Roles(UserRoleEnum.MANAGER, UserRoleEnum.CHIEF)
    async listStaff(@Param("shopId") shopId: string) {
        try {
            const staff = await this.roleManagementService.listStaff(shopId);
            return { staff };
        } catch {
            throw new InternalServerErrorException({ code: "INTERNAL_ERROR" });
        }
    }
}
