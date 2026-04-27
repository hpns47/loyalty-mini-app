import { IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RedeemStampDto {
    @ApiProperty({ description: "QR-токен пользователя (JWT)" })
    @IsString()
    @MinLength(1)
    declare qrToken: string;
}
