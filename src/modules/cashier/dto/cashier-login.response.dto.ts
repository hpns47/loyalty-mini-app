import { ApiProperty } from "@nestjs/swagger";

export class CashierLoginResponseDto {
    @ApiProperty({ description: "JWT токен кассира", example: "eyJhbGci..." })
    accessToken: string;
}
