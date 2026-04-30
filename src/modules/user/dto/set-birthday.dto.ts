import { ApiProperty } from "@nestjs/swagger";
import { IsDateString } from "class-validator";

export class SetBirthdayDto {
    @ApiProperty({ description: "День рождения (YYYY-MM-DD)", example: "1995-05-15" })
    @IsDateString()
    declare birthday: string;
}
