import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { CoffeeShop } from "./entities/coffee-shop.entity";
import { ShopService } from "./shop.service";
import { ShopController } from "./shop.controller";
import { QrModule } from "../qr/qr.module";

@Module({
    imports: [SequelizeModule.forFeature([CoffeeShop]), QrModule],
    controllers: [ShopController],
    providers: [ShopService],
    exports: [ShopService, SequelizeModule],
})
export class ShopModule {}
