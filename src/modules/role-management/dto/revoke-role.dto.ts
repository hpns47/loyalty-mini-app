import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class RevokeRoleDto {
    @ApiProperty({ description: "UUID целевого пользователя" })
    @IsUUID()
    declare targetUserId: string;

    @ApiProperty({ description: "UUID кофейни" })
    @IsUUID()
    declare shopId: string;
}
