import { ApiProperty } from "@nestjs/swagger";

export class StampResultResponseDto {
    @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
    cardId: string;

    @ApiProperty({ example: 4 })
    newStampCount: number;

    @ApiProperty({ example: false })
    isRewardReady: boolean;

    @ApiProperty({ example: "John" })
    userName: string;

    @ApiProperty({ example: 10 })
    stampThreshold: number;
}

export class StampRedeemResponseDto {
    @ApiProperty({ type: StampResultResponseDto })
    stamp: StampResultResponseDto;
}
