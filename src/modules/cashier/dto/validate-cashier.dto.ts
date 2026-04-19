import { IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ValidateCashierDto {
    @ApiProperty({ description: "Slug кофейни", example: "my-coffee-shop" })
    @IsString()
    @MinLength(1)
    declare shopSlug: string;

    @ApiProperty({ description: "Ключ кассира", example: "secret123" })
    @IsString()
    @MinLength(1)
    declare cashierKey: string;
}
