"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("stamps", {
            id: {
                type: Sequelize.BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },
            card_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "loyalty_cards",
                    key: "id",
                },
            },
            qr_token_hash: {
                type: Sequelize.TEXT,
                unique: true,
                allowNull: true,
            },
            added_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("NOW()"),
            },
        });

        await queryInterface.addIndex("stamps", ["card_id"], {
            name: "idx_stamps_card_id",
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("stamps");
    },
};
