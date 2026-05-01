import { Injectable } from "@nestjs/common";
import { Sequelize } from "sequelize-typescript";
import { QueryTypes } from "sequelize";

@Injectable()
export class AdminService {
    constructor(private readonly sequelize: Sequelize) {}

    async getStats() {
        const [row] = await this.sequelize.query<{
            total_users: string;
            total_shops: string;
            total_stamps: string;
            stamps_today: string;
            reward_ready_count: string;
            active_cards: string;
        }>(
            `SELECT
                (SELECT COUNT(*)::int FROM users)                                                        AS total_users,
                (SELECT COUNT(*)::int FROM coffee_shops)                                                 AS total_shops,
                (SELECT COALESCE(SUM(quantity), 0)::int FROM stamps)                                     AS total_stamps,
                (SELECT COALESCE(SUM(quantity), 0)::int FROM stamps
                 WHERE DATE(added_at AT TIME ZONE 'UTC') = CURRENT_DATE)                                 AS stamps_today,
                (SELECT COUNT(*)::int FROM loyalty_cards WHERE status = 'reward_ready')                  AS reward_ready_count,
                (SELECT COUNT(*)::int FROM loyalty_cards WHERE status = 'active')                        AS active_cards`,
            { type: QueryTypes.SELECT },
        );

        return {
            totalUsers: Number(row.total_users),
            totalShops: Number(row.total_shops),
            totalStamps: Number(row.total_stamps),
            stampsToday: Number(row.stamps_today),
            rewardReadyCount: Number(row.reward_ready_count),
            activeCards: Number(row.active_cards),
        };
    }

    async getUsers(page: number, limit: number, search: string) {
        const offset = (page - 1) * limit;
        const searchParam = search ? `%${search}%` : "%";

        const users = await this.sequelize.query<{
            id: string;
            telegram_id: string;
            username: string | null;
            first_name: string;
            last_name: string | null;
            birthday: string | null;
            created_at: string;
            card_count: string;
            current_stamps: string;
            total_stamps_earned: string;
        }>(
            `SELECT
                u.id, u.telegram_id, u.username, u.first_name, u.last_name, u.birthday, u.created_at,
                COUNT(DISTINCT lc.id)::int                        AS card_count,
                COALESCE(SUM(lc.stamp_count), 0)::int             AS current_stamps,
                COALESCE(SUM(lc.total_stamps_earned), 0)::int     AS total_stamps_earned
            FROM users u
            LEFT JOIN loyalty_cards lc ON u.id = lc.user_id
            WHERE u.first_name ILIKE :search
               OR u.last_name  ILIKE :search
               OR u.username   ILIKE :search
            GROUP BY u.id
            ORDER BY u.created_at DESC
            LIMIT :limit OFFSET :offset`,
            {
                replacements: { search: searchParam, limit, offset },
                type: QueryTypes.SELECT,
            },
        );

        const [{ total }] = await this.sequelize.query<{ total: string }>(
            `SELECT COUNT(*)::int AS total FROM users
             WHERE first_name ILIKE :search OR last_name ILIKE :search OR username ILIKE :search`,
            { replacements: { search: searchParam }, type: QueryTypes.SELECT },
        );

        return {
            users: users.map((u) => ({
                id: u.id,
                telegramId: u.telegram_id,
                username: u.username,
                firstName: u.first_name,
                lastName: u.last_name,
                birthday: u.birthday,
                createdAt: u.created_at,
                cardCount: Number(u.card_count),
                currentStamps: Number(u.current_stamps),
                totalStampsEarned: Number(u.total_stamps_earned),
            })),
            total: Number(total),
        };
    }

    async getUserById(userId: string) {
        const [user] = await this.sequelize.query<{
            id: string;
            telegram_id: string;
            username: string | null;
            first_name: string;
            last_name: string | null;
            birthday: string | null;
            created_at: string;
        }>(
            `SELECT id, telegram_id, username, first_name, last_name, birthday, created_at
             FROM users WHERE id = :userId`,
            { replacements: { userId }, type: QueryTypes.SELECT },
        );

        if (!user) return null;

        const cards = await this.sequelize.query<{
            id: string;
            shop_id: string;
            shop_name: string;
            shop_slug: string;
            stamp_count: string;
            total_stamps_earned: string;
            status: string;
        }>(
            `SELECT lc.id, lc.shop_id, cs.name AS shop_name, cs.slug AS shop_slug,
                    lc.stamp_count, lc.total_stamps_earned, lc.status
             FROM loyalty_cards lc
             JOIN coffee_shops cs ON lc.shop_id = cs.id
             WHERE lc.user_id = :userId
             ORDER BY lc.created_at DESC`,
            { replacements: { userId }, type: QueryTypes.SELECT },
        );

        const stamps = await this.sequelize.query<{
            id: string;
            added_at: string;
            quantity: string;
            shop_name: string;
        }>(
            `SELECT s.id, s.added_at, s.quantity, cs.name AS shop_name
             FROM stamps s
             JOIN loyalty_cards lc ON s.card_id = lc.id
             JOIN coffee_shops cs ON lc.shop_id = cs.id
             WHERE lc.user_id = :userId
             ORDER BY s.added_at DESC
             LIMIT 50`,
            { replacements: { userId }, type: QueryTypes.SELECT },
        );

        return {
            id: user.id,
            telegramId: user.telegram_id,
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name,
            birthday: user.birthday,
            createdAt: user.created_at,
            cards: cards.map((c) => ({
                id: c.id,
                shopId: c.shop_id,
                shopName: c.shop_name,
                shopSlug: c.shop_slug,
                stampCount: Number(c.stamp_count),
                totalStampsEarned: Number(c.total_stamps_earned),
                status: c.status,
            })),
            stamps: stamps.map((s) => ({
                id: s.id,
                addedAt: s.added_at,
                quantity: Number(s.quantity),
                shopName: s.shop_name,
            })),
        };
    }

    async getStamps(page: number, limit: number, shopId: string, date: string) {
        const offset = (page - 1) * limit;

        const rows = await this.sequelize.query<{
            id: string;
            added_at: string;
            quantity: string;
            user_id: string;
            first_name: string;
            username: string | null;
            shop_id: string;
            shop_name: string;
            shop_slug: string;
        }>(
            `SELECT
                s.id, s.added_at, s.quantity,
                u.id AS user_id, u.first_name, u.username,
                cs.id AS shop_id, cs.name AS shop_name, cs.slug AS shop_slug
            FROM stamps s
            JOIN loyalty_cards lc ON s.card_id = lc.id
            JOIN users u ON lc.user_id = u.id
            JOIN coffee_shops cs ON lc.shop_id = cs.id
            WHERE (:shopId = '' OR cs.id = :shopId)
              AND (:date = '' OR DATE(s.added_at AT TIME ZONE 'UTC') = :date::date)
            ORDER BY s.added_at DESC
            LIMIT :limit OFFSET :offset`,
            {
                replacements: { shopId: shopId || "", date: date || "", limit, offset },
                type: QueryTypes.SELECT,
            },
        );

        const [{ total }] = await this.sequelize.query<{ total: string }>(
            `SELECT COUNT(*)::int AS total FROM stamps s
             JOIN loyalty_cards lc ON s.card_id = lc.id
             JOIN coffee_shops cs ON lc.shop_id = cs.id
             WHERE (:shopId = '' OR cs.id = :shopId)
               AND (:date = '' OR DATE(s.added_at AT TIME ZONE 'UTC') = :date::date)`,
            {
                replacements: { shopId: shopId || "", date: date || "" },
                type: QueryTypes.SELECT,
            },
        );

        return {
            stamps: rows.map((r) => ({
                id: r.id,
                addedAt: r.added_at,
                quantity: Number(r.quantity),
                userId: r.user_id,
                firstName: r.first_name,
                username: r.username,
                shopId: r.shop_id,
                shopName: r.shop_name,
                shopSlug: r.shop_slug,
            })),
            total: Number(total),
        };
    }

    async getShops() {
        const rows = await this.sequelize.query<{
            id: string;
            name: string;
            slug: string;
            stamp_threshold: string;
            category: string;
            created_at: string;
            total_customers: string;
            total_stamps: string;
            reward_ready_count: string;
            staff_count: string;
        }>(
            `SELECT
                cs.id, cs.name, cs.slug, cs.stamp_threshold, cs.category, cs.created_at,
                COUNT(DISTINCT lc.user_id)::int                                  AS total_customers,
                COALESCE(SUM(lc.total_stamps_earned), 0)::int                    AS total_stamps,
                COUNT(*) FILTER (WHERE lc.status = 'reward_ready')::int          AS reward_ready_count,
                COUNT(DISTINCT ur.user_id)::int                                  AS staff_count
            FROM coffee_shops cs
            LEFT JOIN loyalty_cards lc ON cs.id = lc.shop_id
            LEFT JOIN user_roles ur ON cs.id = ur.shop_id
            GROUP BY cs.id
            ORDER BY cs.name`,
            { type: QueryTypes.SELECT },
        );

        return rows.map((r) => ({
            id: r.id,
            name: r.name,
            slug: r.slug,
            stampThreshold: Number(r.stamp_threshold),
            category: r.category,
            createdAt: r.created_at,
            totalCustomers: Number(r.total_customers),
            totalStamps: Number(r.total_stamps),
            rewardReadyCount: Number(r.reward_ready_count),
            staffCount: Number(r.staff_count),
        }));
    }

    async getShopById(shopId: string) {
        const [shop] = await this.sequelize.query<{
            id: string;
            name: string;
            slug: string;
            stamp_threshold: string;
            category: string;
            created_at: string;
        }>(
            `SELECT id, name, slug, stamp_threshold, category, created_at
             FROM coffee_shops WHERE id = :shopId`,
            { replacements: { shopId }, type: QueryTypes.SELECT },
        );

        if (!shop) return null;

        const staff = await this.sequelize.query<{
            user_id: string;
            first_name: string;
            username: string | null;
            role: string;
        }>(
            `SELECT ur.user_id, u.first_name, u.username, ur.role
             FROM user_roles ur
             JOIN users u ON ur.user_id = u.id
             WHERE ur.shop_id = :shopId
             ORDER BY ur.role, u.first_name`,
            { replacements: { shopId }, type: QueryTypes.SELECT },
        );

        const dailyChart = await this.sequelize.query<{
            date: string;
            stamps_count: string;
            quantity_total: string;
        }>(
            `SELECT
                DATE(s.added_at AT TIME ZONE 'UTC')::text AS date,
                COUNT(s.id)::int                           AS stamps_count,
                COALESCE(SUM(s.quantity), 0)::int          AS quantity_total
             FROM stamps s
             JOIN loyalty_cards lc ON s.card_id = lc.id
             WHERE lc.shop_id = :shopId
               AND s.added_at >= NOW() - INTERVAL '30 days'
             GROUP BY DATE(s.added_at AT TIME ZONE 'UTC')
             ORDER BY date`,
            { replacements: { shopId }, type: QueryTypes.SELECT },
        );

        return {
            id: shop.id,
            name: shop.name,
            slug: shop.slug,
            stampThreshold: Number(shop.stamp_threshold),
            category: shop.category,
            createdAt: shop.created_at,
            staff: staff.map((s) => ({
                userId: s.user_id,
                firstName: s.first_name,
                username: s.username,
                role: s.role,
            })),
            dailyChart: dailyChart.map((d) => ({
                date: d.date,
                stampsCount: Number(d.stamps_count),
                quantityTotal: Number(d.quantity_total),
            })),
        };
    }
}
