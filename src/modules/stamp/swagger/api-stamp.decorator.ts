import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { StampRedeemResponseDto } from "../dto/stamp-result.response.dto";

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
