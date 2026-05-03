"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("coffee_shops", "card_bg_color", {
            type: Sequelize.TEXT,
            allowNull: true,
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn("coffee_shops", "card_bg_color");
    },
};
