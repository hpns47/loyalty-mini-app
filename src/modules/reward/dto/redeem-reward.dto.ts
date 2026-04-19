import { IsString, IsUUID, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RedeemRewardDto {
    @ApiProperty({ description: "UUID пользователя" })
    @IsUUID()
    declare userId: string;

    @ApiProperty({ description: "UUID кофейни" })
    @IsUUID()
    declare shopId: string;

    @ApiProperty({ description: "Ключ кассира" })
    @IsString()
    @MinLength(1)
    declare cashierKey: string;
}
