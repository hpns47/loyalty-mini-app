import { ApiPropertyOptional } from "@nestjs/swagger";
import {
    IsOptional,
    IsString,
    IsBoolean,
    IsInt,
    Min,
    Max,
    IsUrl,
    MinLength,
} from "class-validator";

export class UpdateShopDto {
    @ApiPropertyOptional({ description: "Название заведения" })
    @IsOptional()
    @IsString()
    @MinLength(1)
    declare name?: string;

    @ApiPropertyOptional({ description: "Адрес" })
    @IsOptional()
    @IsString()
    declare address?: string;

    @ApiPropertyOptional({ description: "Телефон" })
    @IsOptional()
    @IsString()
    declare phone?: string;

    @ApiPropertyOptional({ description: "URL логотипа" })
    @IsOptional()
    @IsUrl()
    declare logo_url?: string;

    @ApiPropertyOptional({ description: "Тип награды (free_coffee, discount и т.д.)" })
    @IsOptional()
    @IsString()
    declare reward_type?: string;

    @ApiPropertyOptional({ description: "Порог штампов", minimum: 1, maximum: 50 })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(50)
    declare stamp_threshold?: number;

    @ApiPropertyOptional({ description: "Включить подарок на день рождения" })
    @IsOptional()
    @IsBoolean()
    declare birthday_gift_enabled?: boolean;

    @ApiPropertyOptional({ description: "Описание подарка на день рождения" })
    @IsOptional()
    @IsString()
    declare birthday_gift_description?: string;
}
