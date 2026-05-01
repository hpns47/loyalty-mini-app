import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Query,
    Body,
    UseGuards,
    NotFoundException,
    BadRequestException,
    HttpCode,
    HttpStatus,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AdminAuthGuard } from "../../infrastructure/guards/admin-auth.guard";
import { AdminService } from "./admin.service";

@ApiTags("Admin")
@Controller("api/v1/admin")
@UseGuards(AdminAuthGuard)
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @Get("stats")
    async getStats() {
        return this.adminService.getStats();
    }

    @Get("users")
    async getUsers(
        @Query("page") page = "1",
        @Query("limit") limit = "20",
        @Query("search") search = "",
    ) {
        const p = Math.max(1, parseInt(page) || 1);
        const l = Math.min(100, Math.max(1, parseInt(limit) || 20));
        return this.adminService.getUsers(p, l, search);
    }

    @Get("users/lookup")
    async lookupUser(@Query("q") q: string) {
        if (!q || q.length < 2) return [];
        return this.adminService.lookupUser(q);
    }

    @Get("users/:id")
    async getUserById(@Param("id") id: string) {
        const user = await this.adminService.getUserById(id);
        if (!user) throw new NotFoundException({ error: { code: "USER_NOT_FOUND" } });
        return user;
    }

    @Get("stamps")
    async getStamps(
        @Query("page") page = "1",
        @Query("limit") limit = "50",
        @Query("shopId") shopId = "",
        @Query("date") date = "",
    ) {
        const p = Math.max(1, parseInt(page) || 1);
        const l = Math.min(200, Math.max(1, parseInt(limit) || 50));
        if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            throw new BadRequestException({ error: { code: "INVALID_DATE" } });
        }
        return this.adminService.getStamps(p, l, shopId, date);
    }

    @Get("shops")
    async getShops() {
        return this.adminService.getShops();
    }

    @Post("shops")
    async createShop(
        @Body() body: {
            name: string;
            slug: string;
            category: string;
            stampThreshold: number;
            cashierKey: string;
            logoUrl?: string;
            address?: string;
            phone?: string;
            rewardType?: string;
        },
    ) {
        if (!body.name || !body.slug || !body.cashierKey) {
            throw new BadRequestException({ error: { code: "MISSING_FIELDS" } });
        }
        await this.adminService.createShop(body);
        return { ok: true };
    }

    @Get("shops/:id")
    async getShopById(@Param("id") id: string) {
        const shop = await this.adminService.getShopById(id);
        if (!shop) throw new NotFoundException({ error: { code: "SHOP_NOT_FOUND" } });
        return shop;
    }

    @Patch("shops/:id")
    async updateShop(
        @Param("id") id: string,
        @Body() body: {
            name?: string;
            category?: string;
            stampThreshold?: number;
            logoUrl?: string;
            address?: string;
            phone?: string;
            rewardType?: string;
            birthdayGiftEnabled?: boolean;
            birthdayGiftDescription?: string;
        },
    ) {
        await this.adminService.updateShop(id, body);
        return { ok: true };
    }

    @Post("shops/:id/staff")
    async addStaff(
        @Param("id") shopId: string,
        @Body() body: { userId: string; role: string },
    ) {
        if (!body.userId || !body.role) {
            throw new BadRequestException({ error: { code: "MISSING_FIELDS" } });
        }
        await this.adminService.setStaffRole(shopId, body.userId, body.role);
        return { ok: true };
    }

    @Delete("shops/:id/staff/:userId")
    @HttpCode(HttpStatus.OK)
    async removeStaff(
        @Param("id") shopId: string,
        @Param("userId") userId: string,
    ) {
        await this.adminService.removeStaffRole(shopId, userId);
        return { ok: true };
    }

    @Post("shops/:id/regenerate-key")
    async regenerateKey(
        @Param("id") shopId: string,
        @Body() body: { newKey: string },
    ) {
        if (!body.newKey) {
            throw new BadRequestException({ error: { code: "MISSING_KEY" } });
        }
        await this.adminService.regenerateCashierKey(shopId, body.newKey);
        return { ok: true };
    }
}
