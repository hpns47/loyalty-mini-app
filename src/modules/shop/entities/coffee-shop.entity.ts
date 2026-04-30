import {
    Table,
    Column,
    Model,
    DataType,
    HasMany,
    CreatedAt,
} from "sequelize-typescript";
import { LoyaltyCard } from "../../loyalty-card/entities/loyalty-card.entity";
import { ShopCategory } from "../enums/shop-category.enum";

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

    @Column({
        type: DataType.ENUM(...Object.values(ShopCategory)),
        allowNull: false,
        defaultValue: ShopCategory.COFFEE,
    })
    declare category: ShopCategory;

    @Column({ type: DataType.TEXT, allowNull: true })
    declare logo_url: string | null;

    @Column({ type: DataType.TEXT, allowNull: true })
    declare address: string | null;

    @Column({ type: DataType.TEXT, allowNull: true })
    declare phone: string | null;

    @Column({ type: DataType.TEXT, allowNull: true })
    declare reward_type: string | null;

    @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
    declare birthday_gift_enabled: boolean;

    @Column({ type: DataType.TEXT, allowNull: true })
    declare birthday_gift_description: string | null;

    @CreatedAt
    @Column({ field: "created_at" })
    declare created_at: Date;

    @HasMany(() => LoyaltyCard)
    declare loyalty_cards: LoyaltyCard[];
}
