import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
    constructor(private readonly prisma: PrismaService) {}

    async createComment(
        buildId: string,
        userId: string,
        dto: CreateCommentDto,
    ) {
        return this.prisma.comment.create({
            data: {
                content: dto.content,
                buildId,
                userId,
            },
        });
    }

    async deleteComment(commentId: string, userId: string) {
        const comment = await this.prisma.comment.findFirst({
            where: {
                id: commentId,
                userId,
            },
        });

        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        return this.prisma.comment.delete({
            where: {
                id: comment.id,
            },
        });
    }
}
