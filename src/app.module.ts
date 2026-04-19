import { Module } from "@nestjs/common";
import { ConfigHostModule } from "./config/config.module";
import { AppController } from "./app.controller";
import { DatabaseModule } from "./modules/database/database.module";
import { LocalesModule } from "./modules/locales/locales.module";
import { CacheModule } from "./modules/cache/cache.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UserModule } from "./modules/user/user.module";
import { ShopModule } from "./modules/shop/shop.module";
import { LoyaltyCardModule } from "./modules/loyalty-card/loyalty-card.module";
import { StampModule } from "./modules/stamp/stamp.module";
import { CashierModule } from "./modules/cashier/cashier.module";
import { RewardModule } from "./modules/reward/reward.module";
import { QrModule } from "./modules/qr/qr.module";

@Module({
    imports: [
        ConfigHostModule,
        DatabaseModule,
        LocalesModule,
        CacheModule,
        AuthModule,
        UserModule,
        ShopModule,
        LoyaltyCardModule,
        StampModule,
        CashierModule,
        RewardModule,
        QrModule,
    ],
    controllers: [AppController],
    providers: [],
})
export class AppModule {}
