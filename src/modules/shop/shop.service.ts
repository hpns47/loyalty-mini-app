import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { CoffeeShop } from "./entities/coffee-shop.entity";
import { IShopSummary } from "./interfaces/shop-summary.interface";

@Injectable()
export class ShopService {
    constructor(
        @InjectModel(CoffeeShop)
        private readonly coffeeShopModel: typeof CoffeeShop,
    ) {}

    async getShops(): Promise<IShopSummary[]> {
        const shops = await this.coffeeShopModel.findAll({
            attributes: ["id", "name", "slug", "stamp_threshold"],
        });

        return shops.map((shop) => ({
            id: shop.id,
            name: shop.name,
            slug: shop.slug,
            stamp_threshold: shop.stamp_threshold,
        }));
    }

    async findById(
        shopId: string,
    ): Promise<{ id: string; cashier_key_hash: string; stamp_threshold: number } | null> {
        const shop = await this.coffeeShopModel.findByPk(shopId, {
            attributes: ["id", "cashier_key_hash", "stamp_threshold"],
        });

        if (!shop) return null;

        return {
            id: shop.id,
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
}
