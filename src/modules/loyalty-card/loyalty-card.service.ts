import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Sequelize } from "sequelize-typescript";
import { LoyaltyCard } from "./entities/loyalty-card.entity";
import { CoffeeShop } from "../shop/entities/coffee-shop.entity";
import {
    ICardResponse,
    ICardWithShopResponse,
} from "./interfaces/card-response.interface";

@Injectable()
export class LoyaltyCardService {
    constructor(
        @InjectModel(LoyaltyCard)
        private readonly loyaltyCardModel: typeof LoyaltyCard,
        private readonly sequelize: Sequelize,
    ) {}

    async getOrCreateCard(
        userId: string,
        shopId: string,
    ): Promise<ICardResponse> {
        await this.loyaltyCardModel.findOrCreate({
            where: { user_id: userId, shop_id: shopId },
            defaults: {
                user_id: userId,
                shop_id: shopId,
                stamp_count: 0,
                status: "active",
                is_hidden: false,
            } as any,
        });

        // Re-show card if it was hidden (user navigated to this shop again)
        await this.loyaltyCardModel.update(
            { is_hidden: false },
            { where: { user_id: userId, shop_id: shopId, is_hidden: true } },
        );

        const card = await this.loyaltyCardModel.findOne({
            where: { user_id: userId, shop_id: shopId },
            include: [
                {
                    model: CoffeeShop,
                    attributes: ["stamp_threshold", "card_bg_color"],
                },
            ],
            rejectOnEmpty: true,
        });

        return {
            id: card.id,
            shop_id: card.shop_id,
            stamp_count: card.stamp_count,
            status: card.status,
            stamp_threshold: card.coffee_shop.stamp_threshold,
            card_bg_color: card.coffee_shop.card_bg_color ?? null,
        };
    }

    async getCards(userId: string): Promise<ICardWithShopResponse[]> {
        const cards = await this.loyaltyCardModel.findAll({
            where: { user_id: userId, is_hidden: false },
            include: [
                {
                    model: CoffeeShop,
                    attributes: ["name", "stamp_threshold", "category", "logo_url", "card_bg_color"],
                },
            ],
        });

        return cards.map((card) => ({
            id: card.id,
            shop_id: card.shop_id,
            shop_name: card.coffee_shop.name,
            shop_category: card.coffee_shop.category,
            stamp_count: card.stamp_count,
            status: card.status,
            stamp_threshold: card.coffee_shop.stamp_threshold,
            shop_logo_url: card.coffee_shop.logo_url ?? null,
            card_bg_color: card.coffee_shop.card_bg_color ?? null,
        }));
    }

    async findRewardReadyCard(
        userId: string,
        shopId: string,
    ): Promise<string | null> {
        const card = await this.loyaltyCardModel.findOne({
            where: {
                user_id: userId,
                shop_id: shopId,
                status: "reward_ready",
            },
            attributes: ["id"],
        });

        return card?.id ?? null;
    }

    async resetCard(cardId: string): Promise<void> {
        await this.loyaltyCardModel.update(
            { stamp_count: 0, status: "active", updated_at: new Date() },
            { where: { id: cardId } },
        );
    }

    async ensureCard(userId: string, shopId: string): Promise<string> {
        const [card] = await this.loyaltyCardModel.findOrCreate({
            where: { user_id: userId, shop_id: shopId },
            defaults: {
                user_id: userId,
                shop_id: shopId,
                stamp_count: 0,
                status: "active",
            } as any,
        });

        return card.id;
    }

    async addStampTransaction(
        cardId: string,
        qrTokenHash: string,
        stampThreshold: number,
        stampModel: any,
        quantity: number = 1,
    ): Promise<{ newStampCount: number; isRewardReady: boolean }> {
        return this.sequelize.transaction(async (t) => {
            await stampModel.create(
                { card_id: cardId, qr_token_hash: qrTokenHash, quantity },
                { transaction: t },
            );

            await this.loyaltyCardModel.increment(
                { stamp_count: quantity, total_stamps_earned: quantity },
                { where: { id: cardId }, transaction: t },
            );

            const updatedCard = await this.loyaltyCardModel.findByPk(cardId, {
                transaction: t,
                rejectOnEmpty: true,
            });

            const newStampCount = updatedCard.stamp_count;
            const isRewardReady = newStampCount >= stampThreshold;

            if (isRewardReady) {
                await this.loyaltyCardModel.update(
                    { status: "reward_ready" },
                    { where: { id: cardId }, transaction: t },
                );
            }

            return { newStampCount, isRewardReady };
        });
    }

    async getHiddenCards(userId: string): Promise<ICardWithShopResponse[]> {
        const cards = await this.loyaltyCardModel.findAll({
            where: { user_id: userId, is_hidden: true },
            include: [
                {
                    model: CoffeeShop,
                    attributes: ["name", "stamp_threshold", "category", "logo_url", "card_bg_color"],
                },
            ],
        });

        return cards.map((card) => ({
            id: card.id,
            shop_id: card.shop_id,
            shop_name: card.coffee_shop.name,
            shop_category: card.coffee_shop.category,
            stamp_count: card.stamp_count,
            status: card.status,
            stamp_threshold: card.coffee_shop.stamp_threshold,
            shop_logo_url: card.coffee_shop.logo_url ?? null,
            card_bg_color: card.coffee_shop.card_bg_color ?? null,
        }));
    }

    async hideCard(userId: string, shopId: string): Promise<void> {
        await this.loyaltyCardModel.update(
            { is_hidden: true },
            { where: { user_id: userId, shop_id: shopId } },
        );
    }

    async showCard(userId: string, shopId: string): Promise<void> {
        await this.loyaltyCardModel.update(
            { is_hidden: false },
            { where: { user_id: userId, shop_id: shopId } },
        );
    }
}
