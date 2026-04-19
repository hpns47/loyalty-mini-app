import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { ShopService } from "../shop/shop.service";
import { ICashierValidateResponse } from "./interfaces/cashier-validate.interface";

@Injectable()
export class CashierService {
    constructor(private readonly shopService: ShopService) {}

    async validate(
        shopSlug: string,
        cashierKey: string,
    ): Promise<ICashierValidateResponse> {
        const shop = await this.shopService.findBySlug(shopSlug);

        if (!shop) {
            return { valid: false, shopId: "" };
        }

        const valid = await bcrypt.compare(cashierKey, shop.cashier_key_hash);
        return { valid, shopId: valid ? shop.id : "" };
    }
}
