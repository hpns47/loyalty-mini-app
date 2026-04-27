import { Controller, Post, Body, HttpCode, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { CashierService } from "./cashier.service";
import { ValidateCashierDto } from "./dto/validate-cashier.dto";
import { ApiCashierLogin, ApiCashierLogout } from "./swagger/api-cashier.decorator";
import { CashierAuthGuard } from "../../infrastructure/guards/cashier-auth.guard";

@ApiTags("Cashier")
@Controller("api/v1/cashier")
export class CashierController {
    constructor(private readonly cashierService: CashierService) {}

    @Post("login")
    @HttpCode(200)
    @Throttle({ strict: { ttl: 60_000, limit: 10 } })
    @ApiCashierLogin()
    async login(@Body() dto: ValidateCashierDto) {
        return this.cashierService.login(dto.shopSlug, dto.cashierKey);
    }

    @Post("logout")
    @HttpCode(200)
    @UseGuards(CashierAuthGuard)
    @ApiCashierLogout()
    logout() {
        return { success: true };
    }
}
