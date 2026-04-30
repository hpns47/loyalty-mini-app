import { UserRoleEnum } from "../entities/user-role.entity";

export interface IStaffMember {
    userId: string;
    firstName: string;
    username: string | null;
    role: UserRoleEnum;
}
