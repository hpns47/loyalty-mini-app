import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";

/**
 * Декоратор `@Roles()` устанавливает метаданные ролей, необходимых для доступа к маршруту.
 *
 * Используется в контроллерах или обработчиках, чтобы ограничить доступ к определённым
 * маршрутам на основе ролей пользователя. Эти метаданные позже могут быть считаны
 * guard'ом (например, `RolesGuard`), который сравнивает роли пользователя с требуемыми.
 *
 * @param roles - Один или несколько идентификаторов ролей, например `"admin"`, `"user"`.
 *
 * @returns Функция-декоратор, устанавливающая метаданные `roles` для маршрута или контроллера.
 *
 * @Get()
 * @Roles('admin')
 * findAll() {
 *   return this.userService.findAll();
 * }
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
