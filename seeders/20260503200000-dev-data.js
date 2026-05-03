"use strict";

const { createHash } = require("crypto");

const USER_ID = "66b45cd9-31f0-41b6-ab39-e38ef059eca5";

// Cashier key for all 3 shops: dev1234
const CASHIER_KEY_HASH =
    "$2a$10$VEGzGjwHXEmRLq0YHhD7Bel89PBo/eBRo5ynBYkop2CNoOnquNCHm";

const SHOP_1_ID = "a1000000-0000-4000-8000-000000000001"; // Libre Coffee   — chief here
const SHOP_2_ID = "a2000000-0000-4000-8000-000000000002"; // Monks Coffee   — reward_ready card
const SHOP_3_ID = "a3000000-0000-4000-8000-000000000003"; // Green Tea House — 2 stamps

const CARD_1_ID = "b1000000-0000-4000-8000-000000000001"; // 7/10 active
const CARD_2_ID = "b2000000-0000-4000-8000-000000000002"; // 8/8 reward_ready
const CARD_3_ID = "b3000000-0000-4000-8000-000000000003"; // 2/6 active

const ROLE_ID = "c1000000-0000-4000-8000-000000000001";

const h = (s) => createHash("sha256").update(s).digest("hex");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        // ── User ──────────────────────────────────────────────────────────────
        // Insert only if this exact ID doesn't exist yet (won't clobber real data)
        await queryInterface.sequelize.query(`
            INSERT INTO users (id, telegram_id, username, first_name, created_at, updated_at)
            VALUES ('${USER_ID}', 9876543210, 'devchief', 'Dev Chief', NOW(), NOW())
            ON CONFLICT (id) DO NOTHING
        `);

        // ── Shops ─────────────────────────────────────────────────────────────
        await queryInterface.sequelize.query(`
            INSERT INTO coffee_shops (id, name, slug, cashier_key_hash, stamp_threshold, category, card_bg_color, created_at)
            VALUES
                ('${SHOP_1_ID}', 'Libre Coffee',    'libre-coffee', '${CASHIER_KEY_HASH}', 10, 'coffee', 'linear-gradient(135deg,#1a1a2e 0%,#0f3460 100%)',  NOW()),
                ('${SHOP_2_ID}', 'Monks Coffee',    'monks-coffee', '${CASHIER_KEY_HASH}',  8, 'coffee', 'linear-gradient(135deg,#2c1810 0%,#5c3317 100%)',  NOW()),
                ('${SHOP_3_ID}', 'Green Tea House', 'green-tea',    '${CASHIER_KEY_HASH}',  6, 'tea',    'linear-gradient(135deg,#0d2b1a 0%,#1a5c35 100%)',  NOW())
            ON CONFLICT (slug) DO UPDATE
                SET card_bg_color = EXCLUDED.card_bg_color, name = EXCLUDED.name
        `);

        // Re-select actual IDs (slug may have pre-existed with a different UUID)
        const [[{ id: shop1Id }]] = await queryInterface.sequelize.query(
            `SELECT id FROM coffee_shops WHERE slug = 'libre-coffee'`
        );
        const [[{ id: shop2Id }]] = await queryInterface.sequelize.query(
            `SELECT id FROM coffee_shops WHERE slug = 'monks-coffee'`
        );
        const [[{ id: shop3Id }]] = await queryInterface.sequelize.query(
            `SELECT id FROM coffee_shops WHERE slug = 'green-tea'`
        );

        // ── Loyalty cards ─────────────────────────────────────────────────────
        await queryInterface.sequelize.query(`
            INSERT INTO loyalty_cards (id, user_id, shop_id, stamp_count, status, total_stamps_earned, is_hidden, created_at, updated_at)
            VALUES
                ('${CARD_1_ID}', '${USER_ID}', '${shop1Id}',  7, 'active',       7, false, NOW(), NOW()),
                ('${CARD_2_ID}', '${USER_ID}', '${shop2Id}',  8, 'reward_ready', 8, false, NOW(), NOW()),
                ('${CARD_3_ID}', '${USER_ID}', '${shop3Id}',  2, 'active',       2, false, NOW(), NOW())
            ON CONFLICT ON CONSTRAINT loyalty_cards_user_id_shop_id_unique
            DO UPDATE SET
                stamp_count        = EXCLUDED.stamp_count,
                status             = EXCLUDED.status,
                is_hidden          = false,
                updated_at         = NOW()
        `);

        // Re-select actual card IDs (card may have pre-existed with a different UUID)
        const [[{ id: card1Id }]] = await queryInterface.sequelize.query(
            `SELECT id FROM loyalty_cards WHERE user_id = '${USER_ID}' AND shop_id = '${shop1Id}'`
        );
        const [[{ id: card2Id }]] = await queryInterface.sequelize.query(
            `SELECT id FROM loyalty_cards WHERE user_id = '${USER_ID}' AND shop_id = '${shop2Id}'`
        );
        const [[{ id: card3Id }]] = await queryInterface.sequelize.query(
            `SELECT id FROM loyalty_cards WHERE user_id = '${USER_ID}' AND shop_id = '${shop3Id}'`
        );

        // ── Stamps ────────────────────────────────────────────────────────────
        const stamps = [
            // Card 1 — 7 stamps spread over the last week
            ...Array.from({ length: 7 }, (_, i) =>
                `('${card1Id}', '${h(`dev-c1-${i + 1}`)}', 1, NOW() - INTERVAL '${7 - i} days')`
            ),
            // Card 2 — 8 stamps (reward_ready)
            ...Array.from({ length: 8 }, (_, i) =>
                `('${card2Id}', '${h(`dev-c2-${i + 1}`)}', 1, NOW() - INTERVAL '${8 - i} days')`
            ),
            // Card 3 — 2 stamps
            ...Array.from({ length: 2 }, (_, i) =>
                `('${card3Id}', '${h(`dev-c3-${i + 1}`)}', 1, NOW() - INTERVAL '${2 - i} days')`
            ),
        ];

        await queryInterface.sequelize.query(`
            INSERT INTO stamps (card_id, qr_token_hash, quantity, added_at)
            VALUES ${stamps.join(",\n")}
            ON CONFLICT (qr_token_hash) DO NOTHING
        `);

        // ── Chief role in Libre Coffee ─────────────────────────────────────
        await queryInterface.sequelize.query(`
            INSERT INTO user_roles (id, user_id, shop_id, role, created_at)
            VALUES ('${ROLE_ID}', '${USER_ID}', '${shop1Id}', 'chief', NOW())
            ON CONFLICT (user_id, shop_id) DO UPDATE SET role = 'chief'
        `);
    },

    async down(queryInterface) {
        const stampHashes = [
            ...Array.from({ length: 7 }, (_, i) => `'${h(`dev-c1-${i + 1}`)}'`),
            ...Array.from({ length: 8 }, (_, i) => `'${h(`dev-c2-${i + 1}`)}'`),
            ...Array.from({ length: 2 }, (_, i) => `'${h(`dev-c3-${i + 1}`)}'`),
        ].join(", ");

        await queryInterface.sequelize.query(
            `DELETE FROM user_roles WHERE id = '${ROLE_ID}'`
        );
        await queryInterface.sequelize.query(
            `DELETE FROM stamps WHERE qr_token_hash IN (${stampHashes})`
        );
        await queryInterface.sequelize.query(
            `DELETE FROM loyalty_cards WHERE id IN ('${CARD_1_ID}', '${CARD_2_ID}', '${CARD_3_ID}')`
        );
        await queryInterface.sequelize.query(
            `DELETE FROM coffee_shops WHERE id IN ('${SHOP_1_ID}', '${SHOP_2_ID}', '${SHOP_3_ID}')`
        );
    },
};
