import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    BelongsTo,
    AutoIncrement,
    PrimaryKey,
} from "sequelize-typescript";
import { LoyaltyCard } from "../../loyalty-card/entities/loyalty-card.entity";

@Table({
    tableName: "stamps",
    timestamps: false,
    underscored: true,
})
export class Stamp extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    declare id: number;

    @ForeignKey(() => LoyaltyCard)
    @Column({ type: DataType.UUID, allowNull: false })
    declare card_id: string;

    @Column({ type: DataType.TEXT, unique: true, allowNull: true })
    declare qr_token_hash: string | null;

    @Column({
        type: DataType.DATE,
        defaultValue: DataType.NOW,
        field: "added_at",
    })
    declare added_at: Date;

    @BelongsTo(() => LoyaltyCard)
    declare loyalty_card: LoyaltyCard;
}
