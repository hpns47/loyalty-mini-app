import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiSecurity } from "@nestjs/swagger";
import { ShopSummaryResponseDto, ShopQrResponseDto } from "../dto/shop.response.dto";

export function ApiGetShops() {
    return applyDecorators(
        ApiOperation({ summary: "Получить список кофеен" }),
        ApiSecurity("TelegramAuth"),
        ApiResponse({ status: 200, description: "Список кофеен", type: [ShopSummaryResponseDto] }),
        ApiResponse({ status: 401, description: "Невалидный initData" }),
    );
}

export function ApiGetShopQr() {
    return applyDecorators(
        ApiOperation({ summary: "Генерация QR-кода кофейни по ID (только админ)" }),
        ApiSecurity("AdminAuth"),
        ApiParam({ name: "id", description: "UUID кофейни", example: "550e8400-e29b-41d4-a716-446655440000" }),
        ApiResponse({ status: 200, description: "QR-код сгенерирован", type: ShopQrResponseDto }),
        ApiResponse({ status: 401, description: "Невалидный ключ администратора" }),
        ApiResponse({ status: 404, description: "Кофейня не найдена" }),
    );
}

export function ApiGetShopQrBySlug() {
    return applyDecorators(
        ApiOperation({ summary: "Генерация QR-кода кофейни по slug (только админ)" }),
        ApiSecurity("AdminAuth"),
        ApiParam({ name: "slug", description: "Slug кофейни", example: "diar-coffee" }),
        ApiResponse({ status: 200, description: "QR-код сгенерирован", type: ShopQrResponseDto }),
        ApiResponse({ status: 401, description: "Невалидный ключ администратора" }),
        ApiResponse({ status: 404, description: "Кофейня не найдена" }),
    );
}
