import { ShopCategory } from "../../shop/enums/shop-category.enum";

export interface ICardResponse {
    id: string;
    shop_id: string;
    stamp_count: number;
    status: string;
    stamp_threshold: number;
    card_bg_color?: string | null;
}

export interface ICardWithShopResponse extends ICardResponse {
    shop_name: string;
    shop_category: ShopCategory;
    shop_logo_url?: string | null;
    card_bg_color?: string | null;
}
