import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class LikeService {
    constructor(private readonly prisma: PrismaService) {}

    async likeBuild(buildId: string, userId: string) {
        try {
            return await this.prisma.buildLike.create({
                data: {
                    userId,
                    buildId,
                },
            });
        } catch (e) {
            if (e.code === 'P2002') {
                throw new ConflictException('You already liked this build');
            }

            throw e;
        }
    }

    cancelLike(buildId: string, userId: string) {
        return this.prisma.buildLike.delete({
            where: {
                userId_buildId: {
                    userId,
                    buildId,
                },
            },
        });
    }
}
