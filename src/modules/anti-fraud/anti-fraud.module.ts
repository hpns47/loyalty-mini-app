import { Module } from "@nestjs/common";
import { AntiFraudService } from "./anti-fraud.service";
import { CacheModule } from "../cache/cache.module";

@Module({
    imports: [CacheModule],
    providers: [AntiFraudService],
    exports: [AntiFraudService],
})
export class AntiFraudModule {}
