import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { I18nService } from "nestjs-i18n";
import { ValidationPipe } from "./infrastructure/pipes/validation.pipe";
import helmet from "helmet";
import { MetricsInterceptor } from "./infrastructure/interceptors/metrics.interceptor";
import { MetricsService } from "./modules/metrics/metrics.service";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Swagger
    const config = new DocumentBuilder()
        .setTitle("Loyalty Mini-App API")
        .setDescription("API документация для loyalty mini-app")
        .setVersion("1.0")
        .addApiKey(
            {
                type: "apiKey",
                name: "X-Telegram-Init-Data",
                in: "header",
                description: "Telegram WebApp initData",
            },
            "TelegramAuth",
        )
        .addApiKey(
            {
                type: "apiKey",
                name: "X-Admin-Key",
                in: "header",
                description: "Admin API key",
            },
            "AdminAuth",
        )
        .addBearerAuth(
            {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
                description: "JWT токен кассира (POST /cashier/login)",
            },
            "CashierAuth",
        )
        .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup("/api/docs", app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });

    // Trust Nginx reverse proxy so req.ip uses X-Forwarded-For (needed for rate limiting per real IP)
    app.getHttpAdapter().getInstance().set("trust proxy", 1);

    // Security headers
    app.use(helmet());

    // CORS
    const frontendUrl = process.env.FRONTEND_URL;
    const nodeEnv = process.env.NODE_ENV || "development";

    const allowedOrigins: string[] = [];
    if (frontendUrl) allowedOrigins.push(frontendUrl);
    if (nodeEnv === "development") allowedOrigins.push("http://localhost:5173");

    app.enableCors({
        origin: allowedOrigins,
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "X-Telegram-Init-Data",
            "X-Admin-Key",
        ],
    });

    // Validation
    const validationPipe = new ValidationPipe(app.get(I18nService));
    app.useGlobalPipes(validationPipe);

    // Metrics
    const metricsService = app.get(MetricsService);
    app.useGlobalInterceptors(new MetricsInterceptor(metricsService));

    await app.listen(process.env.APP_PORT ?? 3000);
}

void bootstrap();
