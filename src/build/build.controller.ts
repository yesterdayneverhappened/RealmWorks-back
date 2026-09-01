import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { BuildService } from './build.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { CreateBuildDto } from './dto/create-build.dto';
import { GetBuildsDto } from './dto/get-builds.dto';
import { OptionalJwtGuard } from './guard/optional-jwt.guard';
import { UpdateBuildDto } from './dto/update-build.dto';

@Controller('builds')
export class BuildsController {
    constructor(private readonly buildService: BuildService) { }

    @Get()
    getAllBuilds(
        @Query() query: GetBuildsDto,
        @Req() req: any
    ) {
        return this.buildService.getBuilds(
            query.page,
            query.limit,
            query.search,
            query.sort
        );
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    createBuild(@Body() build: CreateBuildDto, @Req() req: any) {
        return this.buildService.createBuild(build, req.user.id);
    }

    @UseGuards(OptionalJwtGuard)
    @Get(':id')
    getBuild(
        @Param('id') id: string,
        @Req() req: any
    ) {
        return this.buildService.getBuild(id, req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    editBuild(
        @Param('id') id: string,
        @Body() build: UpdateBuildDto,
        @Req() req: any,
    ) {
        return this.buildService.editBuild(id, req.user.id, build);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    deleteBuild(@Param('id') id: string, @Req() req: any) {
        return this.buildService.deleteBuild(id, req.user.id);
    }
}
