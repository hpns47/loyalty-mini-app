import { Injectable, OnModuleInit } from '@nestjs/common';
import { collectDefaultMetrics, Counter, Histogram, Registry } from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
    readonly registry = new Registry();

    readonly httpRequestDuration = new Histogram({
        name: 'http_request_duration_seconds',
        help: 'HTTP request duration in seconds',
        labelNames: ['method', 'route', 'status_code'],
        buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
        registers: [this.registry],
    });

    readonly stampsRedeemed = new Counter({
        name: 'stamps_redeemed_total',
        help: 'Total stamps redeemed successfully',
        labelNames: ['shop_slug'],
        registers: [this.registry],
    });

    readonly rewardsRedeemed = new Counter({
        name: 'rewards_redeemed_total',
        help: 'Total rewards redeemed',
        labelNames: ['shop_slug'],
        registers: [this.registry],
    });

    readonly antiFraudBlocked = new Counter({
        name: 'anti_fraud_blocked_total',
        help: 'Total stamp requests blocked by anti-fraud',
        registers: [this.registry],
    });

    readonly stampErrors = new Counter({
        name: 'stamp_errors_total',
        help: 'Stamp redemption errors by error code',
        labelNames: ['code'],
        registers: [this.registry],
    });

    onModuleInit() {
        collectDefaultMetrics({ register: this.registry, prefix: 'nodejs_' });
    }

    async getMetrics(): Promise<string> {
        return this.registry.metrics();
    }

    getContentType(): string {
        return this.registry.contentType;
    }
}
