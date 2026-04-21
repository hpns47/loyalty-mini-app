import { ApiProperty } from "@nestjs/swagger";

export class StampHistoryItemDto {
    @ApiProperty({ example: "Diar Coffee" })
    shopName: string;

    @ApiProperty({ example: "2026-04-20T10:30:00.000Z" })
    addedAt: Date;
}

export class StampHistoryResponseDto {
    @ApiProperty({ type: [StampHistoryItemDto] })
    history: StampHistoryItemDto[];
}
