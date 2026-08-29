import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { BuildService } from './build.service';
import { BuildsController } from './build.controller';
import { LikeService } from './like/like.service';
import { LikeController } from './like/like.controller';
import { CommentService } from './comment/comment.service';
import { CommentController } from './comment/comment.controller';

@Module({
    imports: [PrismaModule],
    controllers: [BuildsController, LikeController, CommentController],
    providers: [BuildService, LikeService, CommentService],
})
export class BuildModule {}
