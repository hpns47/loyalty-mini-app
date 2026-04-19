import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiSecurity } from "@nestjs/swagger";
import { AuthMeResponseDto } from "../dto/user-profile.response.dto";

export function ApiMe() {
    return applyDecorators(
        ApiOperation({ summary: "Аутентификация через Telegram initData" }),
        ApiSecurity("TelegramAuth"),
        ApiResponse({ status: 200, description: "Пользователь создан/обновлён", type: AuthMeResponseDto }),
        ApiResponse({ status: 401, description: "Невалидный initData" }),
    );
}
