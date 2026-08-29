import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { BuildService } from "./build.service";
import { JwtAuthGuard } from "src/auth/guard/jwt.guard";
import { CreateBuildDto } from "./dto/create-build.dto";

@Controller('builds')
export class BuildsController {
    constructor (private readonly buildService: BuildService) {}

    @Get()
    getAllBuilds() {
        return this.buildService.getBuilds()
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    createBuild(
        @Body() build: CreateBuildDto,
        @Req() req: any
    ) {
        return this.buildService.createBuild(
            build,
            req.user.id
        )
    }

    @Get(':id')
    getBuild(@Param('id') id: string) {
        return this.buildService.getBuild(id)
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    editBuild(
        @Param('id') id: string,
        @Body() build: CreateBuildDto,
        @Req() req: any
    ) {
        return this.buildService.editBuild(
            id,
            req.user.id,
            build
        )
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    deleteBuild(
        @Param('id') id: string,
        @Req() req: any
    ) {
        return this.buildService.deleteBuild(
            id,
            req.user.id
        )
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/like')
    likeBuild(
        @Param('id') id: string,
        @Req() req: any
    ) {
        return this.buildService.likeBuild(id, req.user.id)
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id/like')
    cancelLike(
        @Param('id') id: string,
        @Req() req: any
    ) {
        return this.buildService.cancelLike(id, req.user.id)
    }
}