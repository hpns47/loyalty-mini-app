import {
    Table,
    Column,
    Model,
    DataType,
    HasMany,
    CreatedAt,
} from "sequelize-typescript";
import { LoyaltyCard } from "../../loyalty-card/entities/loyalty-card.entity";

@Table({
    tableName: "coffee_shops",
    timestamps: true,
    underscored: true,
    updatedAt: false,
})
export class CoffeeShop extends Model {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    declare id: string;

    @Column({ type: DataType.TEXT, allowNull: false })
    declare name: string;

    @Column({ type: DataType.TEXT, unique: true, allowNull: false })
    declare slug: string;

    @Column({ type: DataType.TEXT, allowNull: false })
    declare cashier_key_hash: string;

    @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 10 })
    declare stamp_threshold: number;

    @CreatedAt
    @Column({ field: "created_at" })
    declare created_at: Date;

    @HasMany(() => LoyaltyCard)
    declare loyalty_cards: LoyaltyCard[];
}
