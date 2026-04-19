import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { User } from "../user/entities/user.entity";
import { CoffeeShop } from "../shop/entities/coffee-shop.entity";
import { LoyaltyCard } from "../loyalty-card/entities/loyalty-card.entity";
import { Stamp } from "../stamp/entities/stamp.entity";

@Module({
    imports: [
        SequelizeModule.forRoot({
            logging: false,
            dialect: "postgres",
            host: process.env.POSTGRES_HOST,
            port: Number(process.env.POSTGRES_PORT),
            username: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DB,
            dialectOptions: {
                charset: "utf8",
            },
            define: {
                charset: "utf8",
                collate: "utf8_general_ci",
            },
            autoLoadModels: true,
            synchronize: false,
            retryAttempts: 3,
            models: [User, CoffeeShop, LoyaltyCard, Stamp],
        }),
    ],
    exports: [SequelizeModule],
})
export class DatabaseModule {}
