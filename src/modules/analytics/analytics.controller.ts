import {
    Controller,
    Get,
    Query,
    UseGuards,
    InternalServerErrorException,
    BadRequestException,
} from "@nestjs/common";
import { ApiTags, ApiQuery } from "@nestjs/swagger";
import { IsDateString, IsUUID } from "class-validator";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { AnalyticsService } from "./analytics.service";
import { TelegramAuthGuard } from "../../infrastructure/guards/telegram-auth.guard";
import { RoleGuard } from "../../infrastructure/guards/role.guard";
import { Roles } from "../../infrastructure/decorators/roles.decorator";
import { UserRoleEnum } from "../role-management/entities/user-role.entity";

class DailyQuery {
    @IsUUID() shopId: string;
    @IsDateString() date: string;
}

class SummaryQuery {
    @IsUUID() shopId: string;
}

@ApiTags("Analytics")
@Controller("api/v1/analytics")
@UseGuards(TelegramAuthGuard, RoleGuard)
@Roles(UserRoleEnum.MANAGER, UserRoleEnum.CHIEF)
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) {}

    @Get("daily")
    @ApiQuery({ name: "shopId", type: String })
    @ApiQuery({ name: "date", type: String, description: "YYYY-MM-DD" })
    async getDaily(
        @Query("shopId") shopId: string,
        @Query("date") date: string,
    ) {
        const q = plainToInstance(DailyQuery, { shopId, date });
        const errors = await validate(q);
        if (errors.length) {
            throw new BadRequestException({ error: { code: "INVALID_PARAMS", message: "Invalid shopId or date" } });
        }
        try {
            const stats = await this.analyticsService.getDailyStats(shopId, date);
            return { stats };
        } catch {
            throw new InternalServerErrorException({ code: "INTERNAL_ERROR" });
        }
    }

    @Get("summary")
    @ApiQuery({ name: "shopId", type: String })
    async getSummary(@Query("shopId") shopId: string) {
        const q = plainToInstance(SummaryQuery, { shopId });
        const errors = await validate(q);
        if (errors.length) {
            throw new BadRequestException({ error: { code: "INVALID_PARAMS", message: "Invalid shopId" } });
        }
        try {
            const stats = await this.analyticsService.getSummaryStats(shopId);
            return { stats };
        } catch {
            throw new InternalServerErrorException({ code: "INTERNAL_ERROR" });
        }
    }
}
