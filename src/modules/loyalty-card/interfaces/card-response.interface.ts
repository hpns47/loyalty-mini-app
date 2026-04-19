export interface ICardResponse {
    id: string;
    shop_id: string;
    stamp_count: number;
    status: string;
    stamp_threshold: number;
}

export interface ICardWithShopResponse extends ICardResponse {
    shop_name: string;
}
