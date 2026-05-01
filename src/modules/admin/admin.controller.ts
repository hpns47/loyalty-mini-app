import {
    Controller,
    Get,
    Param,
    Query,
    UseGuards,
    NotFoundException,
    BadRequestException,
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

    @Get("shops/:id")
    async getShopById(@Param("id") id: string) {
        const shop = await this.adminService.getShopById(id);
        if (!shop) throw new NotFoundException({ error: { code: "SHOP_NOT_FOUND" } });
        return shop;
    }
}
