import { Module } from "@nestjs/common";
import { CashierController } from "./cashier.controller";
import { CashierService } from "./cashier.service";
import { ShopModule } from "../shop/shop.module";

@Module({
    imports: [ShopModule],
    controllers: [CashierController],
    providers: [CashierService],
})
export class CashierModule {}
