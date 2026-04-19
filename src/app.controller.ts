import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

@ApiTags("Health")
@Controller("/")
export class AppController {
    @Get()
    @ApiOperation({ summary: "Root endpoint" })
    root() {
        return { status: "ok" };
    }

    @Get("health")
    @ApiOperation({ summary: "Health check" })
    health() {
        return { status: "ok" };
    }
}
