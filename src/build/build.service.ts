import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { CreateBuildDto } from "./dto/create-build.dto";
import { title } from "process";
import { BuildSort } from "./enums/build-sort";

@Injectable()
export class BuildService {
    constructor (private readonly prisma: PrismaService) {}

    async getBuilds(
        page: number, 
        limit: number, 
        search?: string, 
        userId?: string, 
        sort?: BuildSort
    ) {
        const skip = (page - 1) * limit;

        const orderBy = {
            [BuildSort.NEWEST]: {
                createdAt: 'desc' as const,
            },
            [BuildSort.OLDEST]: {
                createdAt: 'asc' as const
            },
            [BuildSort.POPULAR]: {
                likes: {
                    _count: 'desc' as const
                }
            },
            [BuildSort.UNPOPULAR]: {
                likes: {
                    _count: 'asc' as const
                }
            },
        }[sort ?? BuildSort.NEWEST];

        const where = search ? {
            OR: [
                {
                    title: {
                        contains: search,
                        mode: 'insensitive' as const,
                    },
                },
                {
                    description: {
                        contains: search,
                        mode: 'insensitive' as const,
                    }
                }
            ]
        } : undefined

        const [builds, total] = await Promise.all([
            this.prisma.build.findMany({
                where,
                skip,
                take: limit,

                orderBy,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            avatarUrl: true
                        },
                    },
                    _count: {
                        select: {
                            likes: true,
                            comments: true
                        }
                    }
                }
            }),

            this.prisma.build.count({ where }),
        ]);

        let likedBuildIds = new Set<string>();

        if(userId) {
            const userLikes = await this.prisma.buildLike.findMany({
                where: {
                    userId,
                    buildId: {
                        in: builds.map(build => build.id)
                    },
                },
                select: {
                    buildId: true
                }
            });

            likedBuildIds = new Set(
                userLikes.map(like => like.buildId)
            );
        }

        const result = builds.map(build => ({
            ...build,
            isLiked: likedBuildIds.has(build.id),
        }))

        const totalPages = Math.ceil(total / limit);

        return {
            data: result,
            meta: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            }
        }
    }

    createBuild(build: CreateBuildDto, userId: string) {
        try {
            return this.prisma.build.create({
                data: {
                    title: build.title,
                    description: build.description,
                    photos: build.photos,
                    schematicUrl: build.schematicUrl,
                    userId
                }
            })
        } catch (e) {
            if (e.code === 'P2002') {
                throw new ConflictException('This email is already registered');
            }

            throw e;
        }
    }

    async getBuild(id: string, userId?: string) {
        const build = await this.prisma.build.findUnique({
            where: {
                id,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    },
                },
            },
        });
    
        if (!build) {
            throw new NotFoundException('Build not found');
        }
    
        let isLiked = false;
    
        if (userId) {
            const like = await this.prisma.buildLike.findUnique({
                where: {
                    userId_buildId: {
                        userId,
                        buildId: id,
                    },
                },
            });
    
            isLiked = !!like;
        }
    
        return {
            ...build,
            isLiked,
        };
    }

    async editBuild(id: string, userId: string, data: CreateBuildDto) {
        const build = await this.prisma.build.findFirst({
            where: {
                id,
                userId
            }
        });

        if(!build) {
            throw new NotFoundException('Build not found');
        }

        return this.prisma.build.update({
            where: { id: build.id },
            data: {
                title: data.title,
                description: data.description,
                photos: data.photos,
                schematicUrl: data.schematicUrl,
            }
        })
    }

    async deleteBuild(id: string, userId: string) {
        const build = await this.prisma.build.findFirst({
            where: {
                id,
                userId
            }
        });

        if(!build) {
            throw new NotFoundException('Build not found');
        }

        return this.prisma.build.delete({
            where: {
                id
            }
        })
    }
}