import { IUserRole } from "./IUserRole.interface";

export interface IUserPayload {
    id: number;
    token: string;
    roles: IUserRole[];
}
