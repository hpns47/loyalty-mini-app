import { Inject, Injectable } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

@Injectable()
export class CacheService {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

    async get(key: string) {
        return await this.cacheManager.get(key);
    }

    async save(
        key: string,
        data: any,
        ttlInSeconds?: number,
    ): Promise<boolean> {
        if (ttlInSeconds) {
            await this.cacheManager.set(key, data, ttlInSeconds * 1000);
        } else {
            await this.cacheManager.set(key, data);
        }
        return true;
    }

    async delete(key: string): Promise<void> {
        await this.cacheManager.del(key);
    }
}
