import {
    Injectable,
    ForbiddenException,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { UserRole, UserRoleEnum } from "./entities/user-role.entity";
import { User } from "../user/entities/user.entity";
import { CoffeeShop } from "../shop/entities/coffee-shop.entity";
import { IStaffMember } from "./interfaces/staff-member.interface";

export interface IMyRole {
    shopId: string;
    shopName: string;
    role: UserRoleEnum;
}

@Injectable()
export class RoleManagementService {
    constructor(
        @InjectModel(UserRole)
        private readonly userRoleModel: typeof UserRole,
        @InjectModel(User)
        private readonly userModel: typeof User,
    ) {}

    async getUserIdByTelegramId(telegramId: number): Promise<string | null> {
        const user = await this.userModel.findOne({
            where: { telegram_id: telegramId },
            attributes: ["id"],
        });
        return user?.id ?? null;
    }

    async getUserRoleForShop(
        telegramId: number,
        shopId: string,
    ): Promise<UserRoleEnum | null> {
        const userId = await this.getUserIdByTelegramId(telegramId);
        if (!userId) return null;

        const record = await this.userRoleModel.findOne({
            where: { user_id: userId, shop_id: shopId },
            attributes: ["role"],
        });

        return record?.role ?? null;
    }

    async assignRole(
        actorTelegramId: number,
        targetUserId: string,
        shopId: string,
        role: UserRoleEnum,
    ): Promise<void> {
        const actorRole = await this.getUserRoleForShop(actorTelegramId, shopId);

        if (actorRole !== UserRoleEnum.CHIEF) {
            throw new ForbiddenException({
                code: "FORBIDDEN",
                message: "Only chief can assign roles",
            });
        }

        const targetUser = await this.userModel.findByPk(targetUserId, {
            attributes: ["id"],
        });
        if (!targetUser) {
            throw new NotFoundException({
                code: "USER_NOT_FOUND",
                message: "Target user not found",
            });
        }

        const [record] = await this.userRoleModel.findOrCreate({
            where: { user_id: targetUserId, shop_id: shopId },
            defaults: { user_id: targetUserId, shop_id: shopId, role } as any,
        });

        if (record.role !== role) {
            await record.update({ role });
        }
    }

    async adminAssignRole(
        targetUserId: string,
        shopId: string,
        role: UserRoleEnum,
    ): Promise<void> {
        const targetUser = await this.userModel.findByPk(targetUserId, {
            attributes: ["id"],
        });
        if (!targetUser) {
            throw new NotFoundException({
                code: "USER_NOT_FOUND",
                message: "Target user not found",
            });
        }

        const [record] = await this.userRoleModel.findOrCreate({
            where: { user_id: targetUserId, shop_id: shopId },
            defaults: { user_id: targetUserId, shop_id: shopId, role } as any,
        });

        if (record.role !== role) {
            await record.update({ role });
        }
    }

    async revokeRole(
        actorTelegramId: number,
        targetUserId: string,
        shopId: string,
    ): Promise<void> {
        const actorRole = await this.getUserRoleForShop(actorTelegramId, shopId);

        if (actorRole !== UserRoleEnum.CHIEF) {
            throw new ForbiddenException({
                code: "FORBIDDEN",
                message: "Only chief can revoke roles",
            });
        }

        await this.userRoleModel.destroy({
            where: { user_id: targetUserId, shop_id: shopId },
        });
    }

    async getMyRoles(telegramId: number): Promise<IMyRole[]> {
        const userId = await this.getUserIdByTelegramId(telegramId);
        if (!userId) return [];

        const records = await this.userRoleModel.findAll({
            where: { user_id: userId },
            include: [{ model: CoffeeShop, attributes: ["id", "name"] }],
        });

        return records.map((r) => ({
            shopId: r.shop_id,
            shopName: (r as any).coffee_shop?.name ?? "",
            role: r.role,
        }));
    }

    async listStaff(shopId: string): Promise<IStaffMember[]> {
        const records = await this.userRoleModel.findAll({
            where: { shop_id: shopId },
            include: [
                {
                    model: User,
                    attributes: ["id", "first_name", "username"],
                },
            ],
        });

        return records.map((r) => ({
            userId: r.user_id,
            firstName: r.user?.first_name ?? "Unknown",
            username: r.user?.username ?? null,
            role: r.role,
        }));
    }
}
