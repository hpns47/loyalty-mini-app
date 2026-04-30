import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    BelongsTo,
    CreatedAt,
} from "sequelize-typescript";
import { User } from "../../user/entities/user.entity";
import { CoffeeShop } from "../../shop/entities/coffee-shop.entity";

export enum UserRoleEnum {
    CASHIER = "cashier",
    MANAGER = "manager",
    CHIEF = "chief",
}

@Table({
    tableName: "user_roles",
    timestamps: true,
    underscored: true,
    updatedAt: false,
    indexes: [{ unique: true, fields: ["user_id", "shop_id"] }],
})
export class UserRole extends Model {
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

    @Column({
        type: DataType.ENUM(...Object.values(UserRoleEnum)),
        allowNull: false,
    })
    declare role: UserRoleEnum;

    @CreatedAt
    @Column({ field: "created_at" })
    declare created_at: Date;

    @BelongsTo(() => User)
    declare user: User;

    @BelongsTo(() => CoffeeShop)
    declare coffee_shop: CoffeeShop;
}
