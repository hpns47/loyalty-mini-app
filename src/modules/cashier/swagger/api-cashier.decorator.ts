import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CashierValidateResponseDto } from "../dto/cashier-validate.response.dto";

export function ApiValidateCashier() {
    return applyDecorators(
        ApiOperation({ summary: "Валидация ключа кассира" }),
        ApiResponse({ status: 200, description: "Результат валидации", type: CashierValidateResponseDto }),
        ApiResponse({ status: 400, description: "Невалидные данные" }),
    );
}
