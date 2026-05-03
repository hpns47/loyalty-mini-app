"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("loyalty_cards", "is_hidden", {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn("loyalty_cards", "is_hidden");
    },
};
