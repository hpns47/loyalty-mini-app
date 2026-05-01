import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from '../../modules/metrics/metrics.service';
import { Request, Response } from 'express';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
    constructor(private readonly metricsService: MetricsService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest<Request>();
        const method = req.method;
        const route = (req.route?.path as string) ?? req.path;
        const start = Date.now();

        return next.handle().pipe(
            tap({
                next: () => {
                    const res = context.switchToHttp().getResponse<Response>();
                    const duration = (Date.now() - start) / 1000;
                    this.metricsService.httpRequestDuration.observe(
                        { method, route, status_code: String(res.statusCode) },
                        duration,
                    );
                },
                error: (err: any) => {
                    const status = (err?.status as number) ?? 500;
                    const duration = (Date.now() - start) / 1000;
                    this.metricsService.httpRequestDuration.observe(
                        { method, route, status_code: String(status) },
                        duration,
                    );
                },
            }),
        );
    }
}
