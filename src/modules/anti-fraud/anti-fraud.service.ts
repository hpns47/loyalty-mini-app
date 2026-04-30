import { Injectable, Logger } from "@nestjs/common";
import { CacheService } from "../cache/cache.service";
import { StampError } from "../stamp/interfaces/stamp-error";

const DAILY_STAMP_LIMIT = 20;

@Injectable()
export class AntiFraudService {
    private readonly logger = new Logger(AntiFraudService.name);

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

        this.logger.log(`checkAndRecord: userId=${userId} shopId=${shopId} current=${current} adding=${quantity} limit=${DAILY_STAMP_LIMIT}`);

        if (current + quantity > DAILY_STAMP_LIMIT) {
            this.logger.warn(`checkAndRecord: DAILY_LIMIT_EXCEEDED userId=${userId} shopId=${shopId} current=${current} requested=${quantity}`);
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
        this.logger.log(`checkAndRecord: saved new count=${current + quantity} for userId=${userId} shopId=${shopId}`);
    }

    async getDailyCount(userId: string, shopId: string): Promise<number> {
        const key = this.dailyKey(userId, shopId);
        return ((await this.cacheService.get(key)) as number) ?? 0;
    }
}
