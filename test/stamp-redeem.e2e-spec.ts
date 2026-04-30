import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ExecutionContext } from "@nestjs/common";
import request from "supertest";
import * as jwt from "jsonwebtoken";
import { getModelToken } from "@nestjs/sequelize";
import { ConfigService } from "@nestjs/config";
import { Sequelize } from "sequelize-typescript";
import { StampController } from "../src/modules/stamp/stamp.controller";
import { StampService } from "../src/modules/stamp/stamp.service";
import { AntiFraudService } from "../src/modules/anti-fraud/anti-fraud.service";
import { CacheService } from "../src/modules/cache/cache.service";
import { CashierAuthGuard } from "../src/infrastructure/guards/cashier-auth.guard";
import { UserService } from "../src/modules/user/user.service";
import { Stamp } from "../src/modules/stamp/entities/stamp.entity";
import { ShopService } from "../src/modules/shop/shop.service";
import { LoyaltyCardService } from "../src/modules/loyalty-card/loyalty-card.service";

const QR_SECRET = "test-qr-secret";
const SHOP_ID = "88069c27-f8dc-4f25-93a1-26a3787800de";
const USER_ID = "baf63d81-4995-4b9e-82d7-9f378a19f69c";

function makeQrToken(userId = USER_ID, ttlSeconds = 60): string {
    return jwt.sign({ sub: userId, exp: Math.floor(Date.now() / 1000) + ttlSeconds }, QR_SECRET);
}

function makeExpiredToken(): string {
    return jwt.sign({ sub: USER_ID, exp: Math.floor(Date.now() / 1000) - 10 }, QR_SECRET);
}

const cacheStore = new Map<string, number>();
const mockCacheService = {
    get: jest.fn(async (key: string) => cacheStore.get(key) ?? null),
    save: jest.fn(async (key: string, value: number) => {
        cacheStore.set(key, value);
        return true;
    }),
    delete: jest.fn(),
};

const mockStampModel = {
    count: jest.fn().mockResolvedValue(0),
    findAll: jest.fn().mockResolvedValue([]),
};

const mockShopService = {
    findById: jest.fn().mockResolvedValue({
        id: SHOP_ID,
        name: "Test Shop",
        stamp_threshold: 10,
    }),
};

const mockUserService = {
    getFirstName: jest.fn().mockResolvedValue("TestUser"),
    getUserIdByTelegramId: jest.fn().mockResolvedValue(USER_ID),
};

const mockLoyaltyCardService = {
    ensureCard: jest.fn().mockResolvedValue("card-id-123"),
    addStampTransaction: jest.fn().mockResolvedValue({
        newStampCount: 1,
        isRewardReady: false,
    }),
};

const mockCashierAuthGuard = {
    canActivate: jest.fn((ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest();
        req.cashierShop = { shopId: SHOP_ID, shopSlug: "test-shop" };
        return true;
    }),
};

describe("Stamp Redeem E2E", () => {
    let app: INestApplication;
    let antiFraudService: AntiFraudService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [StampController],
            providers: [
                StampService,
                AntiFraudService,
                {
                    provide: CacheService,
                    useValue: mockCacheService,
                },
                {
                    provide: getModelToken(Stamp),
                    useValue: mockStampModel,
                },
                {
                    provide: ShopService,
                    useValue: mockShopService,
                },
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
                {
                    provide: LoyaltyCardService,
                    useValue: mockLoyaltyCardService,
                },
                {
                    provide: ConfigService,
                    useValue: {
                        getOrThrow: jest.fn().mockReturnValue(QR_SECRET),
                        get: jest.fn().mockReturnValue(QR_SECRET),
                    },
                },
                {
                    provide: Sequelize,
                    useValue: {},
                },
            ],
        })
            .overrideGuard(CashierAuthGuard)
            .useValue(mockCashierAuthGuard)
            .compile();

        app = module.createNestApplication();
        await app.init();
        antiFraudService = module.get<AntiFraudService>(AntiFraudService);
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        cacheStore.clear();
        mockStampModel.count.mockResolvedValue(0);
        mockLoyaltyCardService.addStampTransaction.mockResolvedValue({
            newStampCount: 1,
            isRewardReady: false,
        });
    });

    describe("POST /api/v1/stamps/redeem", () => {
        it("redeems a valid QR token successfully", async () => {
            const token = makeQrToken();
            const res = await request(app.getHttpServer())
                .post("/api/v1/stamps/redeem")
                .send({ qrToken: token });

            expect(res.status).toBe(201);
            expect(res.body.stamp).toBeDefined();
            expect(res.body.stamp.newStampCount).toBe(1);
        });

        it("returns 401 for expired QR token", async () => {
            const token = makeExpiredToken();
            const res = await request(app.getHttpServer())
                .post("/api/v1/stamps/redeem")
                .send({ qrToken: token });

            expect(res.status).toBe(401);
            expect(res.body.error.code).toBe("QR_TOKEN_INVALID");
        });

        it("returns 409 for already-used QR token", async () => {
            mockStampModel.count.mockResolvedValue(1);

            const token = makeQrToken();
            const res = await request(app.getHttpServer())
                .post("/api/v1/stamps/redeem")
                .send({ qrToken: token });

            expect(res.status).toBe(409);
            expect(res.body.error.code).toBe("QR_TOKEN_ALREADY_USED");
        });

        it("returns 429 when daily limit exceeded", async () => {
            // Pre-fill daily limit
            await antiFraudService.checkAndRecord(USER_ID, SHOP_ID, 20);

            const token = makeQrToken();
            const res = await request(app.getHttpServer())
                .post("/api/v1/stamps/redeem")
                .send({ qrToken: token });

            expect(res.status).toBe(429);
            expect(res.body.error.code).toBe("DAILY_LIMIT_EXCEEDED");
        });

        it("returns 422 when quantity exceeds stamp threshold", async () => {
            const token = makeQrToken();
            const res = await request(app.getHttpServer())
                .post("/api/v1/stamps/redeem")
                .send({ qrToken: token, quantity: 99 });

            expect(res.status).toBe(422);
            expect(res.body.error.code).toBe("QUANTITY_EXCEEDS_THRESHOLD");
        });

        it("redeems multiple stamps with quantity param", async () => {
            mockLoyaltyCardService.addStampTransaction.mockResolvedValue({
                newStampCount: 3,
                isRewardReady: false,
            });

            const token = makeQrToken();
            const res = await request(app.getHttpServer())
                .post("/api/v1/stamps/redeem")
                .send({ qrToken: token, quantity: 3 });

            expect(res.status).toBe(201);
            expect(res.body.stamp.newStampCount).toBe(3);
        });
    });
});
