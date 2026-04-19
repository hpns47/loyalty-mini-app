import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Stamp } from "./entities/stamp.entity";
import { StampService } from "./stamp.service";
import { StampController } from "./stamp.controller";
import { ShopModule } from "../shop/shop.module";
import { UserModule } from "../user/user.module";
import { LoyaltyCardModule } from "../loyalty-card/loyalty-card.module";

@Module({
    imports: [
        SequelizeModule.forFeature([Stamp]),
        ShopModule,
        UserModule,
        LoyaltyCardModule,
    ],
    controllers: [StampController],
    providers: [StampService],
    exports: [StampService],
})
export class StampModule {}
