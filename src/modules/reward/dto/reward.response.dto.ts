import { ApiProperty } from "@nestjs/swagger";

export class RewardRedeemResponseDto {
    @ApiProperty({ example: true })
    success: boolean;
}
