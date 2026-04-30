import { IsString, MinLength, IsInt, Min, Max, IsOptional } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RedeemStampDto {
    @ApiProperty({ description: "QR-токен пользователя (JWT)" })
    @IsString()
    @MinLength(1)
    declare qrToken: string;

    @ApiPropertyOptional({ description: "Количество штампов (1–10)", example: 1, default: 1 })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(10)
    quantity?: number;
}
