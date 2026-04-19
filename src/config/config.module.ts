import { Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";
import { validationSchema } from "./validation.schema";
import config from "./config";

@Module({
    imports: [
        NestConfigModule.forRoot({
            load: [config],
            isGlobal: true,
            validationSchema,
            envFilePath: `.env.${process.env.NODE_ENV || "development"}`,
        }),
    ],
    exports: [NestConfigModule],
})
export class ConfigHostModule {}
