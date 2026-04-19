import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { LoyaltyCard } from "./entities/loyalty-card.entity";
import { LoyaltyCardService } from "./loyalty-card.service";
import { LoyaltyCardController } from "./loyalty-card.controller";
import { UserModule } from "../user/user.module";

@Module({
    imports: [SequelizeModule.forFeature([LoyaltyCard]), UserModule],
    controllers: [LoyaltyCardController],
    providers: [LoyaltyCardService],
    exports: [LoyaltyCardService, SequelizeModule],
})
export class LoyaltyCardModule {}
