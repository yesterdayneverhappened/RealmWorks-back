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

    async getComments(
        page: number,
        limit: number,
        buildId: string,
    ) {
        const skip = (page - 1) * limit;
    
        const [comments, total] = await Promise.all([
            this.prisma.comment.findMany({
                where: {
                    buildId,
                },
    
                skip,
                take: limit,
    
                orderBy: {
                    createdAt: 'desc',
                },
    
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            avatarUrl: true,
                        },
                    },
                },
            }),
    
            this.prisma.comment.count({
                where: {
                    buildId,
                },
            }),
        ]);
    
        const totalPages = Math.ceil(total / limit);
    
        return {
            data: comments,
    
            meta: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }
}
