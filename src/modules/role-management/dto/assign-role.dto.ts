import { ApiProperty } from "@nestjs/swagger";
import { IsUUID, IsEnum } from "class-validator";
import { UserRoleEnum } from "../entities/user-role.entity";

export class AssignRoleDto {
    @ApiProperty({ description: "UUID целевого пользователя", example: "550e8400-e29b-41d4-a716-446655440000" })
    @IsUUID()
    declare targetUserId: string;

    @ApiProperty({ description: "UUID кофейни", example: "550e8400-e29b-41d4-a716-446655440001" })
    @IsUUID()
    declare shopId: string;

    @ApiProperty({ enum: UserRoleEnum, description: "Роль сотрудника" })
    @IsEnum(UserRoleEnum)
    declare role: UserRoleEnum;
}
