import { HttpException, HttpStatus } from "@nestjs/common";
import { ValidationError } from "./interfaces/validation-exception.interface";

/**
 * Исключение `ValidationException` используется для генерации ошибки HTTP 400 (Bad Request)
 * с подробным списком ошибок валидации.
 *
 * Обычно выбрасывается вручную в сервисах или пайпах, когда данные не проходят кастомную валидацию.
 *
 * @property messages - Массив объектов `ValidationError`, содержащих информацию об ошибках валидации.
 */
export class ValidationException extends HttpException {
    messages: ValidationError[];

    constructor(public validationErrors: ValidationError[]) {
        super(validationErrors, HttpStatus.BAD_REQUEST);
        this.messages = validationErrors;
    }
}
