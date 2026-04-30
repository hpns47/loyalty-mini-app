import { Test, TestingModule } from "@nestjs/testing";
import { AntiFraudService } from "../src/modules/anti-fraud/anti-fraud.service";
import { CacheService } from "../src/modules/cache/cache.service";
import { StampError } from "../src/modules/stamp/interfaces/stamp-error";

const mockCacheService = () => {
    const store = new Map<string, number>();
    return {
        get: jest.fn(async (key: string) => store.get(key) ?? null),
        save: jest.fn(async (key: string, value: number, _ttl?: number) => {
            store.set(key, value);
            return true;
        }),
        delete: jest.fn(async (key: string) => store.delete(key)),
        _store: store,
        _reset: () => store.clear(),
    };
};

describe("AntiFraudService", () => {
    let service: AntiFraudService;
    let cache: ReturnType<typeof mockCacheService>;

    beforeEach(async () => {
        cache = mockCacheService();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AntiFraudService,
                { provide: CacheService, useValue: cache },
            ],
        }).compile();

        service = module.get<AntiFraudService>(AntiFraudService);
    });

    const USER_ID = "user-123";
    const SHOP_ID = "shop-456";

    describe("checkAndRecord", () => {
        it("allows stamp within daily limit", async () => {
            await expect(
                service.checkAndRecord(USER_ID, SHOP_ID, 1),
            ).resolves.not.toThrow();
        });

        it("tracks cumulative quantity across calls", async () => {
            await service.checkAndRecord(USER_ID, SHOP_ID, 5);
            await service.checkAndRecord(USER_ID, SHOP_ID, 5);

            const count = await service.getDailyCount(USER_ID, SHOP_ID);
            expect(count).toBe(10);
        });

        it("throws DAILY_LIMIT_EXCEEDED when limit is reached", async () => {
            // Fill up to limit (20)
            await service.checkAndRecord(USER_ID, SHOP_ID, 10);
            await service.checkAndRecord(USER_ID, SHOP_ID, 10);

            await expect(
                service.checkAndRecord(USER_ID, SHOP_ID, 1),
            ).rejects.toMatchObject({
                code: "DAILY_LIMIT_EXCEEDED",
            });
        });

        it("throws DAILY_LIMIT_EXCEEDED when single quantity exceeds remaining", async () => {
            await service.checkAndRecord(USER_ID, SHOP_ID, 15);

            await expect(
                service.checkAndRecord(USER_ID, SHOP_ID, 10),
            ).rejects.toMatchObject({
                code: "DAILY_LIMIT_EXCEEDED",
            });
        });

        it("allows different users independently", async () => {
            await service.checkAndRecord(USER_ID, SHOP_ID, 10);
            await service.checkAndRecord(USER_ID, SHOP_ID, 10);

            // Different user — should not be affected
            await expect(
                service.checkAndRecord("other-user", SHOP_ID, 10),
            ).resolves.not.toThrow();
        });

        it("allows same user in different shops independently", async () => {
            await service.checkAndRecord(USER_ID, SHOP_ID, 10);
            await service.checkAndRecord(USER_ID, SHOP_ID, 10);

            // Different shop — should not be affected
            await expect(
                service.checkAndRecord(USER_ID, "other-shop", 10),
            ).resolves.not.toThrow();
        });

        it("saves correct TTL (seconds until end of day)", async () => {
            await service.checkAndRecord(USER_ID, SHOP_ID, 1);

            const ttl = cache.save.mock.calls[0][2];
            expect(ttl).toBeGreaterThan(0);
            expect(ttl).toBeLessThanOrEqual(86400);
        });

        it("error is instance of StampError", async () => {
            await service.checkAndRecord(USER_ID, SHOP_ID, 20);

            try {
                await service.checkAndRecord(USER_ID, SHOP_ID, 1);
                fail("Should have thrown");
            } catch (err) {
                expect(err).toBeInstanceOf(StampError);
                expect((err as StampError).code).toBe("DAILY_LIMIT_EXCEEDED");
            }
        });
    });

    describe("getDailyCount", () => {
        it("returns 0 when no stamps recorded", async () => {
            const count = await service.getDailyCount(USER_ID, SHOP_ID);
            expect(count).toBe(0);
        });

        it("returns recorded count", async () => {
            await service.checkAndRecord(USER_ID, SHOP_ID, 3);
            const count = await service.getDailyCount(USER_ID, SHOP_ID);
            expect(count).toBe(3);
        });
    });
});
