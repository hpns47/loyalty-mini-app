"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("loyalty_cards", {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.literal("gen_random_uuid()"),
                primaryKey: true,
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "users",
                    key: "id",
                },
                onDelete: "CASCADE",
            },
            shop_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "coffee_shops",
                    key: "id",
                },
            },
            stamp_count: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            status: {
                type: Sequelize.TEXT,
                allowNull: false,
                defaultValue: "active",
            },
            total_stamps_earned: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            created_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("NOW()"),
            },
            updated_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("NOW()"),
            },
        });

        await queryInterface.addConstraint("loyalty_cards", {
            fields: ["user_id", "shop_id"],
            type: "unique",
            name: "loyalty_cards_user_id_shop_id_unique",
        });

        await queryInterface.addIndex("loyalty_cards", ["user_id"], {
            name: "idx_loyalty_cards_user_id",
        });

        await queryInterface.addIndex("loyalty_cards", ["shop_id"], {
            name: "idx_loyalty_cards_shop_id",
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("loyalty_cards");
    },
};
