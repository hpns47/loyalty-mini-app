import { Module } from "@nestjs/common";
import { CacheModule as Cache } from "@nestjs/cache-manager";
import { createKeyv } from "@keyv/redis";
import { CacheService } from "./cache.service";

@Module({
    imports: [
        Cache.registerAsync({
            isGlobal: true,
            useFactory: () => ({
                stores: [createKeyv(process.env.REDIS_URL)],
            }),
        }),
    ],
    providers: [CacheService],
    exports: [CacheService],
})
export class CacheModule {}
