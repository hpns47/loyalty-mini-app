import { Injectable, ForbiddenException, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { User } from "./entities/user.entity";
import { ITelegramUser } from "../auth/interfaces/telegram-user.interface";
import { IUserProfile } from "./interfaces/user-profile.interface";

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User)
        private readonly userModel: typeof User,
    ) {}

    async getUserIdByTelegramId(telegramId: number): Promise<string> {
        const user = await this.userModel.findOne({
            where: { telegram_id: telegramId },
            attributes: ["id"],
        });

        if (!user) {
            throw new Error("User not found");
        }

        return user.id;
    }

    async upsertUser(telegramUser: ITelegramUser): Promise<IUserProfile> {
        const [user] = await this.userModel.upsert(
            {
                telegram_id: telegramUser.id,
                username: telegramUser.username ?? null,
                first_name: telegramUser.first_name,
                last_name: telegramUser.last_name ?? null,
                updated_at: new Date(),
            },
            {
                conflictFields: ["telegram_id"],
                returning: true,
            },
        );

        return {
            id: user.id,
            telegram_id: user.telegram_id,
            username: user.username,
            first_name: user.first_name,
            birthday: user.birthday,
        };
    }

    async setBirthday(userId: string, birthday: string): Promise<void> {
        const user = await this.userModel.findByPk(userId, {
            attributes: ["id", "birthday"],
        });

        if (!user) {
            throw new NotFoundException({ code: "USER_NOT_FOUND", message: "User not found" });
        }

        if (user.birthday !== null) {
            throw new ForbiddenException({ code: "BIRTHDAY_ALREADY_SET", message: "Birthday can only be set once" });
        }

        await user.update({ birthday });
    }

    async getFirstName(userId: string): Promise<string> {
        const user = await this.userModel.findByPk(userId, {
            attributes: ["first_name"],
        });

        return user?.first_name ?? "";
    }
}
