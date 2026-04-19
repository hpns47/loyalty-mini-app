"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("users", {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.literal("gen_random_uuid()"),
                primaryKey: true,
            },
            telegram_id: {
                type: Sequelize.BIGINT,
                unique: true,
                allowNull: false,
            },
            username: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            first_name: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            last_name: {
                type: Sequelize.TEXT,
                allowNull: true,
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
    },

    async down(queryInterface) {
        await queryInterface.dropTable("users");
    },
};
