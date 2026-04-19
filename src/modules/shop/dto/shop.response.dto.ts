import { ApiProperty } from "@nestjs/swagger";

export class ShopSummaryResponseDto {
    @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
    id: string;

    @ApiProperty({ example: "Моя кофейня" })
    name: string;

    @ApiProperty({ example: "my-coffee-shop" })
    slug: string;

    @ApiProperty({ example: 10 })
    stamp_threshold: number;
}

export class ShopQrResponseDto {
    @ApiProperty({ example: "data:image/png;base64,..." })
    qrDataUrl: string;

    @ApiProperty({ example: "tg://resolve?domain=mybot&start=..." })
    deepLink: string;
}
