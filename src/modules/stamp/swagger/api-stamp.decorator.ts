import { applyDecorators } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { StampRedeemResponseDto } from "../dto/stamp-result.response.dto";
import { StampHistoryResponseDto } from "../dto/stamp-history.response.dto";

export function ApiRedeemStamp() {
    return applyDecorators(
        ApiOperation({ summary: "Погашение штампа (сканирование QR кассиром)" }),
        ApiResponse({ status: 200, description: "Штамп добавлен", type: StampRedeemResponseDto }),
        ApiResponse({ status: 401, description: "Невалидный ключ кассира или QR" }),
        ApiResponse({ status: 404, description: "Кофейня не найдена" }),
        ApiResponse({ status: 409, description: "QR уже использован" }),
        ApiResponse({ status: 429, description: "Rate limit — штамп уже добавлен недавно" }),
    );
}

export function ApiGetStampHistory() {
    return applyDecorators(
        ApiOperation({ summary: "История штампов текущего пользователя (последние 50)" }),
        ApiBearerAuth("telegram-init-data"),
        ApiResponse({ status: 200, description: "Список штампов по всем кофейням", type: StampHistoryResponseDto }),
        ApiResponse({ status: 401, description: "Невалидные Telegram initData" }),
        ApiResponse({ status: 500, description: "Внутренняя ошибка сервера" }),
    );
}
