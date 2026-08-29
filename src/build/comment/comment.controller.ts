import { Body, Controller, Delete, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('builds')
export class CommentController {
    constructor(private readonly commentService: CommentService) {}

    @UseGuards(JwtAuthGuard)
    @Post(':id/comment')
    commentBuild(
        @Param('id') id: string,
        @Req() req: any,
        @Body() dto: CreateCommentDto,
    ) {
        return this.commentService.createComment(id, req.user.id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id/comment')
    deleteComment(@Param('id') id: string, @Req() req: any) {
        return this.commentService.deleteComment(id, req.user.id);
    }
}
