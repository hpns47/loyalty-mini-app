import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { RewardRedeemResponseDto } from "../dto/reward.response.dto";

export function ApiRedeemReward() {
    return applyDecorators(
        ApiOperation({ summary: "Получение награды (сброс карты)" }),
        ApiResponse({ status: 200, description: "Награда получена", type: RewardRedeemResponseDto }),
        ApiResponse({ status: 401, description: "Невалидный ключ кассира" }),
        ApiResponse({ status: 404, description: "Кофейня или карта не найдена" }),
    );
}
