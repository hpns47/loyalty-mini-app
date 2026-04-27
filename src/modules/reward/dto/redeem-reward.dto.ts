import { IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RedeemRewardDto {
    @ApiProperty({ description: "UUID пользователя" })
    @IsUUID()
    declare userId: string;
}
