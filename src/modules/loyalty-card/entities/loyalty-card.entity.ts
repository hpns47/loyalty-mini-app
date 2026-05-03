import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    BelongsTo,
    HasMany,
    CreatedAt,
    UpdatedAt,
} from "sequelize-typescript";
import { User } from "../../user/entities/user.entity";
import { CoffeeShop } from "../../shop/entities/coffee-shop.entity";
import { Stamp } from "../../stamp/entities/stamp.entity";

@Table({
    tableName: "loyalty_cards",
    timestamps: true,
    underscored: true,
    indexes: [
        { unique: true, fields: ["user_id", "shop_id"] },
    ],
})
export class LoyaltyCard extends Model {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    declare id: string;

    @ForeignKey(() => User)
    @Column({ type: DataType.UUID, allowNull: false })
    declare user_id: string;

    @ForeignKey(() => CoffeeShop)
    @Column({ type: DataType.UUID, allowNull: false })
    declare shop_id: string;

    @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
    declare stamp_count: number;

    @Column({ type: DataType.TEXT, allowNull: false, defaultValue: "active" })
    declare status: string;

    @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
    declare total_stamps_earned: number;

    @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
    declare is_hidden: boolean;

    @CreatedAt
    @Column({ field: "created_at" })
    declare created_at: Date;

    @UpdatedAt
    @Column({ field: "updated_at" })
    declare updated_at: Date;

    @BelongsTo(() => User)
    declare user: User;

    @BelongsTo(() => CoffeeShop)
    declare coffee_shop: CoffeeShop;

    @HasMany(() => Stamp)
    declare stamps: Stamp[];
}
