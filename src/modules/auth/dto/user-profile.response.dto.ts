import { ApiProperty } from "@nestjs/swagger";

export class UserProfileResponseDto {
    @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
    id: string;

    @ApiProperty({ example: 123456789 })
    telegram_id: number;

    @ApiProperty({ example: "johndoe", nullable: true, type: String })
    username: string | null;

    @ApiProperty({ example: "John" })
    first_name: string;
}

export class AuthMeResponseDto {
    @ApiProperty({ type: UserProfileResponseDto })
    user: UserProfileResponseDto;
}
