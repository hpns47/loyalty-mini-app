import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { CashierController } from "./cashier.controller";
import { CashierService } from "./cashier.service";
import { ShopModule } from "../shop/shop.module";
import { UserModule } from "../user/user.module";
import { UserRole } from "../role-management/entities/user-role.entity";

@Module({
    imports: [
        ShopModule,
        UserModule,
        SequelizeModule.forFeature([UserRole]),
    ],
    controllers: [CashierController],
    providers: [CashierService],
})
export class CashierModule {}
