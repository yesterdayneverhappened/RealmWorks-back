import { Controller, Delete, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { LikeService } from './like.service';

@Controller('builds')
export class LikeController {
    constructor(private readonly likeService: LikeService) {}

    @UseGuards(JwtAuthGuard)
    @Post(':id/like')
    likeBuild(@Param('id') id: string, @Req() req: any) {
        return this.likeService.likeBuild(id, req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id/like')
    cancelLike(@Param('id') id: string, @Req() req: any) {
        return this.likeService.cancelLike(id, req.user.id);
    }
}
