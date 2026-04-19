import { Controller, Post, Body } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CashierService } from "./cashier.service";
import { ValidateCashierDto } from "./dto/validate-cashier.dto";
import { ApiValidateCashier } from "./swagger/api-cashier.decorator";

@ApiTags("Cashier")
@Controller("api/v1/cashier")
export class CashierController {
    constructor(private readonly cashierService: CashierService) {}

    @Post("validate")
    @ApiValidateCashier()
    async validate(@Body() dto: ValidateCashierDto) {
        return this.cashierService.validate(dto.shopSlug, dto.cashierKey);
    }
}
