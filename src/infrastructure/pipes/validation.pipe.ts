import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { ValidationException } from "../exceptions/validation.execption";
import { I18nContext, I18nService } from "nestjs-i18n";

@Injectable()
export class ValidationPipe implements PipeTransform {
    constructor(private readonly i18n: I18nService) {}

    async transform<T>(value: any, metadata: ArgumentMetadata): Promise<any> {
        if (!metadata.metatype || !this.toValidate(metadata.metatype)) {
            return value;
        }

        const obj: T = plainToInstance(metadata.metatype as new () => T, value);
        const errors: ValidationError[] = await validate(obj as object);

        if (errors.length) {
            const messages = errors.map((error: ValidationError) => {
                const constraints = Object.values(error.constraints || {}).map(
                    (constraint: string) =>
                        this.i18n.t(constraint, {
                            lang: I18nContext.current()?.lang,
                        }),
                );

                return {
                    property: error.property,
                    error: `${constraints.join(", ")}`,
                };
            });

            throw new ValidationException(messages);
        }

        return value;
    }

    private toValidate(metaType: new (...args: any[]) => any): boolean {
        const types: Array<new (...args: any[]) => any> = [
            String,
            Boolean,
            Number,
            Array,
            Object,
        ];
        return !types.includes(metaType);
    }
}
