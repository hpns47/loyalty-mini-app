import { Module } from "@nestjs/common";
import { AntiFraudService } from "./anti-fraud.service";
import { CacheModule } from "../cache/cache.module";
import { MetricsModule } from "../metrics/metrics.module";

@Module({
    imports: [CacheModule, MetricsModule],
    providers: [AntiFraudService],
    exports: [AntiFraudService],
})
export class AntiFraudModule {}
