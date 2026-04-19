"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("coffee_shops", {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.literal("gen_random_uuid()"),
                primaryKey: true,
            },
            name: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            slug: {
                type: Sequelize.TEXT,
                unique: true,
                allowNull: false,
            },
            cashier_key_hash: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            stamp_threshold: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 10,
            },
            created_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("NOW()"),
            },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("coffee_shops");
    },
};
