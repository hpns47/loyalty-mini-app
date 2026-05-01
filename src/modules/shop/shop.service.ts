import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { CoffeeShop } from "./entities/coffee-shop.entity";
import { IShopBasic } from "./interfaces/shop-basic.interface";
import { IShopSummary } from "./interfaces/shop-summary.interface";
import { UpdateShopDto } from "./dto/update-shop.dto";

@Injectable()
export class ShopService {
    constructor(
        @InjectModel(CoffeeShop)
        private readonly coffeeShopModel: typeof CoffeeShop,
    ) {}

    async getShops(): Promise<IShopSummary[]> {
        const shops = await this.coffeeShopModel.findAll({
            attributes: ["id", "name", "slug", "stamp_threshold", "category"],
        });

        return shops.map((shop) => ({
            id: shop.id,
            name: shop.name,
            slug: shop.slug,
            stamp_threshold: shop.stamp_threshold,
            category: shop.category,
        }));
    }

    async findById(shopId: string): Promise<IShopBasic | null> {
        const shop = await this.coffeeShopModel.findByPk(shopId, {
            attributes: ["id", "name", "slug", "cashier_key_hash", "stamp_threshold"],
        });

        if (!shop) return null;

        return {
            id: shop.id,
            name: shop.name,
            slug: shop.slug,
            cashier_key_hash: shop.cashier_key_hash,
            stamp_threshold: shop.stamp_threshold,
        };
    }

    async findBySlug(
        slug: string,
    ): Promise<{ id: string; cashier_key_hash: string } | null> {
        const shop = await this.coffeeShopModel.findOne({
            where: { slug },
            attributes: ["id", "cashier_key_hash"],
        });

        if (!shop) return null;

        return {
            id: shop.id,
            cashier_key_hash: shop.cashier_key_hash,
        };
    }

    async findFullById(shopId: string): Promise<CoffeeShop> {
        const shop = await this.coffeeShopModel.findByPk(shopId);
        if (!shop) {
            throw new NotFoundException({ code: "SHOP_NOT_FOUND", message: "Shop not found" });
        }
        return shop;
    }

    async updateShop(shopId: string, dto: UpdateShopDto): Promise<CoffeeShop> {
        const shop = await this.coffeeShopModel.findByPk(shopId);
        if (!shop) {
            throw new NotFoundException({ code: "SHOP_NOT_FOUND", message: "Shop not found" });
        }
        await shop.update(dto);
        return shop;
    }
}
