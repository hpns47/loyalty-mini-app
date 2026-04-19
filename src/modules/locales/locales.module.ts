import { Module } from "@nestjs/common";
import * as path from "path";

import {
    I18nModule,
    I18nJsonLoader,
    QueryResolver,
    AcceptLanguageResolver,
    HeaderResolver,
} from "nestjs-i18n";

@Module({
    imports: [
        I18nModule.forRoot({
            fallbackLanguage: "ru",
            loader: I18nJsonLoader,
            loaderOptions: {
                path: path.join(__dirname, "..", "/locales/"),
                watch: true,
            },
            resolvers: [
                { use: QueryResolver, options: ["lang"] },
                AcceptLanguageResolver,
                new HeaderResolver(["x-lang"]),
            ],
        }),
    ],
    exports: [],
})
export class LocalesModule {}
