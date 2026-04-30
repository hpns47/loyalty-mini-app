import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { UserRole } from "./entities/user-role.entity";
import { RoleManagementService } from "./role-management.service";
import { RoleManagementController } from "./role-management.controller";
import { RoleGuard } from "../../infrastructure/guards/role.guard";
import { UserModule } from "../user/user.module";

@Module({
    imports: [
        SequelizeModule.forFeature([UserRole]),
        UserModule,
    ],
    controllers: [RoleManagementController],
    providers: [RoleManagementService, RoleGuard],
    exports: [RoleManagementService, RoleGuard],
})
export class RoleManagementModule {}
