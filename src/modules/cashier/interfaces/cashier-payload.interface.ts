export interface ICashierPayload {
    sub: string;
    shopSlug: string;
    role: "cashier";
    userId?: string;
}
