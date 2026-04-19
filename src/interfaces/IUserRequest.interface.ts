import { IUserPayload } from "./IUserPayload.interface";

export interface IUserRequest extends Request {
    user: IUserPayload;
}
