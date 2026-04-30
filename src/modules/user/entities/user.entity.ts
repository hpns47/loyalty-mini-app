import {
    Table,
    Column,
    Model,
    DataType,
    HasMany,
    CreatedAt,
    UpdatedAt,
} from "sequelize-typescript";
import { LoyaltyCard } from "../../loyalty-card/entities/loyalty-card.entity";

@Table({ tableName: "users", timestamps: true, underscored: true })
export class User extends Model {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    declare id: string;

    @Column({ type: DataType.BIGINT, unique: true, allowNull: false })
    declare telegram_id: number;

    @Column({ type: DataType.TEXT, allowNull: true })
    declare username: string | null;

    @Column({ type: DataType.TEXT, allowNull: false })
    declare first_name: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    declare last_name: string | null;

    @Column({ type: DataType.DATEONLY, allowNull: true })
    declare birthday: string | null;

    @CreatedAt
    @Column({ field: "created_at" })
    declare created_at: Date;

    @UpdatedAt
    @Column({ field: "updated_at" })
    declare updated_at: Date;

    @HasMany(() => LoyaltyCard)
    declare loyalty_cards: LoyaltyCard[];
}
