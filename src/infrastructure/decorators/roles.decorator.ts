import { SetMetadata } from "@nestjs/common";
import { UserRoleEnum } from "../../modules/role-management/entities/user-role.entity";

export const ROLES_KEY = "roles";
export const Roles = (...roles: UserRoleEnum[]) => SetMetadata(ROLES_KEY, roles);
