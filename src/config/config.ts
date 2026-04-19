export default () => ({
    port: parseInt(process.env.APP_PORT || "3000", 10),
    nodeEnv: process.env.NODE_ENV || "development",
    jwtSecret: process.env.JWT_SECRET,
    botToken: process.env.BOT_TOKEN,
    qrSecret: process.env.QR_SECRET,
    cashierKeySalt: process.env.CASHIER_KEY_SALT,
    botUsername: process.env.BOT_USERNAME,
    miniAppName: process.env.MINI_APP_NAME,
    adminKey: process.env.ADMIN_KEY,
    frontendUrl: process.env.FRONTEND_URL,
    database: {
        host: process.env.POSTGRES_HOST,
        port: parseInt(process.env.POSTGRES_PORT || "5432", 10),
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        name: process.env.POSTGRES_DB,
    },
    redis: {
        host: process.env.REDIS_URL || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379", 10),
    },
});
