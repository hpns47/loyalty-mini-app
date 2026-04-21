import { ShopCategory } from "../enums/shop-category.enum";

export interface IShopSummary {
    id: string;
    name: string;
    slug: string;
    stamp_threshold: number;
    category: ShopCategory;
}
