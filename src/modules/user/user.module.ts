import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { User } from "./entities/user.entity";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { QrModule } from "../qr/qr.module";

@Module({
    imports: [SequelizeModule.forFeature([User]), QrModule],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService, SequelizeModule],
})
export class UserModule {}
