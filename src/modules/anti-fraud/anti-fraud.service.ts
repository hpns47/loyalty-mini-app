import { Injectable } from "@nestjs/common";
import { CacheService } from "../cache/cache.service";
import { StampError } from "../stamp/interfaces/stamp-error";

const DAILY_STAMP_LIMIT = 20;

@Injectable()
export class AntiFraudService {
    constructor(private readonly cacheService: CacheService) {}

    private dailyKey(userId: string, shopId: string): string {
        const today = new Date().toISOString().slice(0, 10);
        return `af:daily:${userId}:${shopId}:${today}`;
    }

    private secondsUntilEndOfDay(): number {
        const now = new Date();
        const end = new Date(now);
        end.setHours(23, 59, 59, 999);
        return Math.ceil((end.getTime() - now.getTime()) / 1000);
    }

    async checkAndRecord(
        userId: string,
        shopId: string,
        quantity: number,
    ): Promise<void> {
        const key = this.dailyKey(userId, shopId);
        const current = ((await this.cacheService.get(key)) as number) ?? 0;

        if (current + quantity > DAILY_STAMP_LIMIT) {
            throw new StampError(
                "DAILY_LIMIT_EXCEEDED",
                `Daily stamp limit (${DAILY_STAMP_LIMIT}) reached for this shop`,
            );
        }

        await this.cacheService.save(
            key,
            current + quantity,
            this.secondsUntilEndOfDay(),
        );
    }

    async getDailyCount(userId: string, shopId: string): Promise<number> {
        const key = this.dailyKey(userId, shopId);
        return ((await this.cacheService.get(key)) as number) ?? 0;
    }
}
