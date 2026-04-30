"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("coffee_shops", "logo_url", {
            type: Sequelize.TEXT,
            allowNull: true,
        });
        await queryInterface.addColumn("coffee_shops", "address", {
            type: Sequelize.TEXT,
            allowNull: true,
        });
        await queryInterface.addColumn("coffee_shops", "phone", {
            type: Sequelize.TEXT,
            allowNull: true,
        });
        await queryInterface.addColumn("coffee_shops", "reward_type", {
            type: Sequelize.TEXT,
            allowNull: true,
        });
        await queryInterface.addColumn("coffee_shops", "birthday_gift_enabled", {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        });
        await queryInterface.addColumn("coffee_shops", "birthday_gift_description", {
            type: Sequelize.TEXT,
            allowNull: true,
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn("coffee_shops", "logo_url");
        await queryInterface.removeColumn("coffee_shops", "address");
        await queryInterface.removeColumn("coffee_shops", "phone");
        await queryInterface.removeColumn("coffee_shops", "reward_type");
        await queryInterface.removeColumn("coffee_shops", "birthday_gift_enabled");
        await queryInterface.removeColumn("coffee_shops", "birthday_gift_description");
    },
};
