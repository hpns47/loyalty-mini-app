import { Module } from "@nestjs/common";
import { BotService } from "./bot.service";
import { RoleManagementModule } from "../role-management/role-management.module";

@Module({
    imports: [RoleManagementModule],
    providers: [BotService],
})
export class BotModule {}
