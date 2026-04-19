import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AdminAuthGuard implements CanActivate {
    private readonly adminKey: string;

    constructor(private readonly configService: ConfigService) {
        this.adminKey = this.configService.get<string>("adminKey");
    }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const key = request.headers["x-admin-key"];

        if (!key || key !== this.adminKey) {
            throw new UnauthorizedException({
                code: "UNAUTHORIZED",
                message: "Invalid admin key",
            });
        }

        return true;
    }
}
