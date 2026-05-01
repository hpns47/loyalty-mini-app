import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
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
import { RoleManagementModule } from "./modules/role-management/role-management.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { BotModule } from "./modules/bot/bot.module";
import { AdminModule } from "./modules/admin/admin.module";
import { MetricsModule } from "./modules/metrics/metrics.module";

@Module({
    imports: [
        ThrottlerModule.forRoot([
            { name: "default", ttl: 60_000, limit: 60 },
            { name: "strict", ttl: 60_000, limit: 10 },
        ]),
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
        RoleManagementModule,
        AnalyticsModule,
        BotModule,
        AdminModule,
        MetricsModule,
    ],
    controllers: [AppController],
    providers: [
        { provide: APP_GUARD, useClass: ThrottlerGuard },
    ],
})
export class AppModule {}
