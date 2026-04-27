import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { ICashierShop } from "../../modules/cashier/interfaces/cashier-shop.interface";

export const CashierShop = createParamDecorator(
    (data: keyof ICashierShop | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const cashierShop: ICashierShop = request.cashierShop;
        return data ? cashierShop?.[data] : cashierShop;
    },
);
