"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        // Enable RLS
        await queryInterface.sequelize.query(
            `ALTER TABLE users ENABLE ROW LEVEL SECURITY;`,
        );
        await queryInterface.sequelize.query(
            `ALTER TABLE loyalty_cards ENABLE ROW LEVEL SECURITY;`,
        );
        await queryInterface.sequelize.query(
            `ALTER TABLE stamps ENABLE ROW LEVEL SECURITY;`,
        );

        // RLS policies
        await queryInterface.sequelize.query(`
            CREATE POLICY "users_own_rows" ON users
            FOR ALL USING (telegram_id = (current_setting('app.telegram_id', true))::bigint);
        `);

        await queryInterface.sequelize.query(`
            CREATE POLICY "cards_own_rows" ON loyalty_cards
            FOR ALL USING (
                user_id = (SELECT id FROM users WHERE telegram_id = (current_setting('app.telegram_id', true))::bigint)
            );
        `);

        // add_stamp function
        await queryInterface.sequelize.query(`
            CREATE OR REPLACE FUNCTION add_stamp(
                p_card_id        UUID,
                p_qr_token_hash  TEXT,
                p_stamp_threshold INT
            )
            RETURNS TABLE(new_stamp_count INT, is_reward_ready BOOLEAN)
            LANGUAGE plpgsql
            AS $$
            DECLARE
                v_new_count INT;
                v_is_reward BOOLEAN;
            BEGIN
                INSERT INTO stamps (card_id, qr_token_hash) VALUES (p_card_id, p_qr_token_hash);

                UPDATE loyalty_cards
                SET
                    stamp_count         = stamp_count + 1,
                    total_stamps_earned = total_stamps_earned + 1,
                    updated_at          = NOW()
                WHERE id = p_card_id
                RETURNING stamp_count INTO v_new_count;

                v_is_reward := v_new_count >= p_stamp_threshold;

                IF v_is_reward THEN
                    UPDATE loyalty_cards SET status = 'reward_ready' WHERE id = p_card_id;
                END IF;

                RETURN QUERY SELECT v_new_count, v_is_reward;
            END;
            $$;
        `);
    },

    async down(queryInterface) {
        await queryInterface.sequelize.query(
            `DROP FUNCTION IF EXISTS add_stamp;`,
        );
        await queryInterface.sequelize.query(
            `DROP POLICY IF EXISTS "cards_own_rows" ON loyalty_cards;`,
        );
        await queryInterface.sequelize.query(
            `DROP POLICY IF EXISTS "users_own_rows" ON users;`,
        );
        await queryInterface.sequelize.query(
            `ALTER TABLE stamps DISABLE ROW LEVEL SECURITY;`,
        );
        await queryInterface.sequelize.query(
            `ALTER TABLE loyalty_cards DISABLE ROW LEVEL SECURITY;`,
        );
        await queryInterface.sequelize.query(
            `ALTER TABLE users DISABLE ROW LEVEL SECURITY;`,
        );
    },
};
