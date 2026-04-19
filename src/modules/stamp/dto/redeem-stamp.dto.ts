import { IsString, IsUUID, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RedeemStampDto {
    @ApiProperty({ description: "QR-токен пользователя (JWT)" })
    @IsString()
    @MinLength(1)
    declare qrToken: string;

    @ApiProperty({ description: "UUID кофейни" })
    @IsUUID()
    declare shopId: string;

    @ApiProperty({ description: "Ключ кассира" })
    @IsString()
    @MinLength(1)
    declare cashierKey: string;
}
