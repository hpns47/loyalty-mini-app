import { ApiProperty } from "@nestjs/swagger";
import { ShopCategory } from "../../shop/enums/shop-category.enum";

export class CardResponseDto {
    @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
    id: string;

    @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440001" })
    shop_id: string;

    @ApiProperty({ example: 3 })
    stamp_count: number;

    @ApiProperty({ example: "active", enum: ["active", "reward_ready"] })
    status: string;

    @ApiProperty({ example: 10 })
    stamp_threshold: number;
}

export class CardWithShopResponseDto extends CardResponseDto {
    @ApiProperty({ example: "Моя кофейня" })
    shop_name: string;

    @ApiProperty({ example: ShopCategory.COFFEE, enum: ShopCategory })
    shop_category: ShopCategory;
}

export class CardsListResponseDto {
    @ApiProperty({ type: [CardWithShopResponseDto] })
    cards: CardWithShopResponseDto[];
}

export class CardDetailResponseDto {
    @ApiProperty({ type: CardResponseDto })
    card: CardResponseDto;
}
