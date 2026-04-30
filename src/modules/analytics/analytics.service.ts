import { Injectable } from "@nestjs/common";
import { Sequelize } from "sequelize-typescript";
import { QueryTypes } from "sequelize";
import { IDailyStats, ISummaryStats } from "./interfaces/analytics.interface";

@Injectable()
export class AnalyticsService {
    constructor(private readonly sequelize: Sequelize) {}

    async getDailyStats(shopId: string, date: string): Promise<IDailyStats> {
        const rows = await this.sequelize.query<{
            stamps_count: string;
            quantity_total: string;
            unique_customers: string;
        }>(
            `SELECT
                COUNT(s.id)::int          AS stamps_count,
                COALESCE(SUM(s.quantity), 0)::int AS quantity_total,
                COUNT(DISTINCT lc.user_id)::int   AS unique_customers
            FROM stamps s
            JOIN loyalty_cards lc ON s.card_id = lc.id
            WHERE lc.shop_id = :shopId
              AND DATE(s.added_at AT TIME ZONE 'UTC') = :date::date`,
            {
                replacements: { shopId, date },
                type: QueryTypes.SELECT,
            },
        );

        const row = rows[0] ?? { stamps_count: "0", quantity_total: "0", unique_customers: "0" };

        return {
            date,
            stampsCount: Number(row.stamps_count),
            quantityTotal: Number(row.quantity_total),
            uniqueCustomers: Number(row.unique_customers),
        };
    }

    async getSummaryStats(shopId: string): Promise<ISummaryStats> {
        const [cardRows] = await this.sequelize.query<{
            total_customers: string;
            total_stamps: string;
            reward_ready_count: string;
            stamp_threshold: string;
        }>(
            `SELECT
                COUNT(DISTINCT lc.user_id)::int                              AS total_customers,
                COALESCE(SUM(lc.total_stamps_earned), 0)::int                AS total_stamps,
                COUNT(*) FILTER (WHERE lc.status = 'reward_ready')::int      AS reward_ready_count,
                MAX(cs.stamp_threshold)::int                                  AS stamp_threshold
            FROM loyalty_cards lc
            JOIN coffee_shops cs ON lc.shop_id = cs.id
            WHERE lc.shop_id = :shopId`,
            {
                replacements: { shopId },
                type: QueryTypes.SELECT,
            },
        );

        const row = cardRows ?? {
            total_customers: "0",
            total_stamps: "0",
            reward_ready_count: "0",
            stamp_threshold: "10",
        };

        const totalStamps = Number(row.total_stamps);
        const threshold = Number(row.stamp_threshold) || 10;

        return {
            totalCustomers: Number(row.total_customers),
            totalStamps,
            rewardReadyCount: Number(row.reward_ready_count),
            estimatedRewardsGiven: Math.floor(totalStamps / threshold),
        };
    }
}
