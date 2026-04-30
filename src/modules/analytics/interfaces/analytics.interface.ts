export interface IDailyStats {
    date: string;
    stampsCount: number;
    quantityTotal: number;
    uniqueCustomers: number;
}

export interface ISummaryStats {
    totalCustomers: number;
    totalStamps: number;
    rewardReadyCount: number;
    estimatedRewardsGiven: number;
}
