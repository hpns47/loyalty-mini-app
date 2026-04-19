import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiSecurity } from "@nestjs/swagger";
import { UserQrResponseDto } from "../dto/user-qr.response.dto";

export function ApiGetUserQr() {
    return applyDecorators(
        ApiOperation({ summary: "Генерация QR-кода пользователя" }),
        ApiSecurity("TelegramAuth"),
        ApiResponse({ status: 200, description: "QR-код сгенерирован", type: UserQrResponseDto }),
        ApiResponse({ status: 401, description: "Невалидный initData" }),
    );
}
