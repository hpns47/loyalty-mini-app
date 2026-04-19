import { ApiProperty } from "@nestjs/swagger";

export class UserQrResponseDto {
    @ApiProperty({ example: "data:image/png;base64,..." })
    qrDataUrl: string;

    @ApiProperty({ example: 1716000000 })
    expiresAt: number;
}
