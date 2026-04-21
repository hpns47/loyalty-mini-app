"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.sequelize.query(
            `CREATE TYPE shop_category AS ENUM ('coffee', 'food', 'tea', 'other')`,
        );
        await queryInterface.addColumn("coffee_shops", "category", {
            type: Sequelize.ENUM("coffee", "food", "tea", "other"),
            allowNull: false,
            defaultValue: "coffee",
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn("coffee_shops", "category");
        await queryInterface.sequelize.query(`DROP TYPE IF EXISTS shop_category`);
    },
};
