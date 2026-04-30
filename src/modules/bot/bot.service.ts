import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Telegraf, Context } from "telegraf";
import { RoleManagementService } from "../role-management/role-management.service";

const START_TEXT = `
<b>Loyalty App — программа лояльности для кофеен</b>

Накапливайте штампы, получайте бесплатный кофе и эксклюзивные награды!

<b>Как это работает:</b>
1. Покупаете напиток — кассир сканирует ваш QR-код
2. Накапливаете штампы на карточке
3. Заполнили карточку — получаете награду

<b>Команды:</b>
/start — это сообщение
/app — открыть приложение
/qr — показать мой QR-код для штампа
/admin — панель управления (для менеджеров и владельцев)
/help — помощь
`.trim();

@Injectable()
export class BotService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(BotService.name);
    private bot: Telegraf | null = null;

    constructor(
        private readonly configService: ConfigService,
        private readonly roleManagementService: RoleManagementService,
    ) {}

    async onModuleInit() {
        const token = this.configService.get<string>("botToken");
        if (!token || token === "your_bot_token_here") {
            this.logger.warn("BOT_TOKEN not configured — bot disabled");
            return;
        }

        this.bot = new Telegraf(token);
        this.registerCommands();

        this.bot.launch().catch((err) =>
            this.logger.error("Bot launch error", err),
        );
        this.logger.log("Telegram bot started");
    }

    async onModuleDestroy() {
        this.bot?.stop("SIGTERM");
    }

    private registerCommands() {
        if (!this.bot) return;
        const frontendUrl =
            this.configService.get<string>("frontendUrl") ?? "";

        this.bot.command(["start", "help"], (ctx) =>
            this.handleStart(ctx, frontendUrl),
        );
        this.bot.command("app", (ctx) => this.handleApp(ctx, frontendUrl));
        this.bot.command("qr", (ctx) => this.handleQr(ctx, frontendUrl));
        this.bot.command("admin", (ctx) =>
            this.handleAdmin(ctx, frontendUrl),
        );

        this.bot.on("message", (ctx) => this.handleStart(ctx, frontendUrl));
    }

    private async handleStart(ctx: Context, frontendUrl: string) {
        await ctx.reply(START_TEXT, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    [{ text: "🎫 Открыть приложение", web_app: { url: frontendUrl } }],
                ],
            },
        });
    }

    private async handleApp(ctx: Context, frontendUrl: string) {
        await ctx.reply("Открываю приложение лояльности:", {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "🎫 Моя карточка", web_app: { url: frontendUrl } }],
                ],
            },
        });
    }

    private async handleQr(ctx: Context, frontendUrl: string) {
        await ctx.reply("Покажите этот QR кассиру для получения штампа:", {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "📱 Показать QR", web_app: { url: frontendUrl } }],
                ],
            },
        });
    }

    private async handleAdmin(ctx: Context, frontendUrl: string) {
        const telegramId = ctx.from?.id;
        if (!telegramId) return;

        let roles;
        try {
            roles = await this.roleManagementService.getMyRoles(telegramId);
        } catch {
            await ctx.reply("Ошибка при проверке прав.");
            return;
        }

        const adminRoles = roles.filter(
            (r) => r.role === "manager" || r.role === "chief",
        );

        if (adminRoles.length === 0) {
            await ctx.reply("У вас нет прав управления заведением.");
            return;
        }

        for (const r of adminRoles) {
            const buttons: { text: string; web_app: { url: string } }[][] = [
                [
                    {
                        text: "📊 Аналитика",
                        web_app: {
                            url: `${frontendUrl}/analytics?shopId=${r.shopId}`,
                        },
                    },
                ],
            ];

            if (r.role === "chief") {
                buttons[0].push({
                    text: "⚙️ Настройки",
                    web_app: {
                        url: `${frontendUrl}/shop-settings?shopId=${r.shopId}`,
                    },
                });
                buttons.push([
                    {
                        text: "👥 Сотрудники",
                        web_app: {
                            url: `${frontendUrl}/roles?shopId=${r.shopId}`,
                        },
                    },
                ]);
            }

            await ctx.reply(`🏪 <b>${r.shopName}</b>`, {
                parse_mode: "HTML",
                reply_markup: { inline_keyboard: buttons },
            });
        }
    }
}
