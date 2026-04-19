import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiSecurity } from "@nestjs/swagger";
import { CardsListResponseDto, CardDetailResponseDto } from "../dto/card.response.dto";

export function ApiGetCards() {
    return applyDecorators(
        ApiOperation({ summary: "Получить все карты лояльности пользователя" }),
        ApiSecurity("TelegramAuth"),
        ApiResponse({ status: 200, description: "Список карт", type: CardsListResponseDto }),
        ApiResponse({ status: 401, description: "Невалидный initData" }),
    );
}

export function ApiGetOrCreateCard() {
    return applyDecorators(
        ApiOperation({ summary: "Получить или создать карту для конкретной кофейни" }),
        ApiSecurity("TelegramAuth"),
        ApiParam({ name: "shopId", description: "UUID кофейни", example: "550e8400-e29b-41d4-a716-446655440000" }),
        ApiResponse({ status: 200, description: "Карта лояльности", type: CardDetailResponseDto }),
        ApiResponse({ status: 401, description: "Невалидный initData" }),
    );
}
