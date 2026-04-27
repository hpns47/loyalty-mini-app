import { applyDecorators } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiSecurity } from "@nestjs/swagger";
import { CashierLoginResponseDto } from "../dto/cashier-login.response.dto";

export function ApiCashierLogin() {
    return applyDecorators(
        ApiOperation({ summary: "Авторизация кассира — возвращает JWT токен" }),
        ApiResponse({ status: 201, description: "Токен выдан", type: CashierLoginResponseDto }),
        ApiResponse({ status: 401, description: "Неверный ключ кассира или кофейня не найдена" }),
        ApiResponse({ status: 400, description: "Невалидные данные" }),
    );
}

export function ApiCashierLogout() {
    return applyDecorators(
        ApiOperation({ summary: "Выход кассира (клиент удаляет токен)" }),
        ApiBearerAuth("CashierAuth"),
        ApiResponse({ status: 200, description: "Успешно" }),
        ApiResponse({ status: 401, description: "Невалидный токен" }),
    );
}

export function ApiValidateCashier() {
    return applyDecorators(
        ApiOperation({ summary: "Валидация ключа кассира (устаревший эндпоинт)" }),
        ApiResponse({ status: 200, description: "Результат валидации" }),
        ApiResponse({ status: 400, description: "Невалидные данные" }),
    );
}

export function ApiCashierProtected() {
    return applyDecorators(
        ApiBearerAuth("CashierAuth"),
        ApiSecurity("CashierAuth"),
        ApiResponse({ status: 401, description: "Невалидный или истёкший токен кассира" }),
    );
}
