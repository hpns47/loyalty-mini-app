import Joi from "joi";

export const validationSchema: Joi.ObjectSchema = Joi.object({
    APP_PORT: Joi.number().required(),
    NODE_ENV: Joi.string()
        .valid("development", "production", "test")
        .default("development"),
    JWT_SECRET: Joi.string().required(),
    BOT_TOKEN: Joi.string().required(),
    QR_SECRET: Joi.string().required(),
    CASHIER_KEY_SALT: Joi.string().required(),
    BOT_USERNAME: Joi.string().required(),
    MINI_APP_NAME: Joi.string().required(),
    ADMIN_KEY: Joi.string().required(),
    FRONTEND_URL: Joi.string().uri().optional().allow(""),
    POSTGRES_HOST: Joi.string().required(),
    POSTGRES_PORT: Joi.number().required(),
    POSTGRES_USER: Joi.string().required(),
    POSTGRES_PASSWORD: Joi.string().required(),
    POSTGRES_DB: Joi.string().required(),
    REDIS_URL: Joi.string().required(),
    REDIS_PORT: Joi.number().required(),
});
