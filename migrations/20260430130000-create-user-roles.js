"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("user_roles", {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.literal("gen_random_uuid()"),
                primaryKey: true,
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: "users", key: "id" },
                onDelete: "CASCADE",
            },
            shop_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: "coffee_shops", key: "id" },
                onDelete: "CASCADE",
            },
            role: {
                type: Sequelize.ENUM("cashier", "manager", "chief"),
                allowNull: false,
            },
            created_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("NOW()"),
            },
        });

        await queryInterface.addIndex("user_roles", ["user_id", "shop_id"], {
            name: "idx_user_roles_user_shop",
            unique: true,
        });

        await queryInterface.addIndex("user_roles", ["shop_id"], {
            name: "idx_user_roles_shop_id",
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("user_roles");
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_user_roles_role"');
    },
};
