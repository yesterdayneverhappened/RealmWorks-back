import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { CreateBuildDto } from "./dto/create-build.dto";
import { title } from "process";
import { BuildSort } from "./enums/build-sort";
import { FilesService } from "src/files/files.service";
import { UpdateBuildDto } from "./dto/update-build.dto";

@Injectable()
export class BuildService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly fileService: FilesService
    ) { }

    async getBuilds(
        page: number,
        limit: number,
        search?: string,
        userId?: string,
        sort?: BuildSort,
        categoryId?: string,
        tags?: string
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

        const where = {
            ...(search && {
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
                        },
                    },
                ],
            }),

            ...(categoryId && { categoryId }),

            ...(tags && {
                AND: tags.split(',').map((tag) => ({
                    tags: {
                        some: {
                            tag: {
                                slug: tag,
                            },
                        },
                    },
                })),
            }),
        };

        const [builds, total] = await Promise.all([
            this.prisma.build.findMany({
                where,
                skip,
                take: limit,

                orderBy,
                include: {
                    category: true,
                    tags: {
                        include: {
                            tag: true
                        }
                    },
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

        if (userId) {
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

    async createBuild(
        data: CreateBuildDto,
        userId: string,
    ) {
        const tags = await Promise.all(
            data.tags.map((tag) => {
                const slug = tag.trim().toLowerCase();

                return this.prisma.tag.upsert({
                    where: {
                        slug,
                    },
                    update: {},
                    create: {
                        name: tag.trim(),
                        slug,
                    },
                });
            }),
        );

        return this.prisma.build.create({
            data: {
                title: data.title,
                description: data.description,
                photos: data.photos,
                schematicUrl: data.schematicUrl,

                userId,
                categoryId: data.categoryId,

                tags: {
                    create: tags.map((tag) => ({
                        tagId: tag.id,
                    })),
                },
            },

            include: {
                category: true,

                tags: {
                    include: {
                        tag: true,
                    },
                },

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
    }

    async getBuild(id: string, userId?: string) {
        const build = await this.prisma.build.findUnique({
            where: {
                id,
            },
            include: {
                category: true,
                tags: {
                    include: {
                        tag: true
                    }
                },
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

    async editBuild(id: string, userId: string, data: UpdateBuildDto) {
        const build = await this.prisma.build.findFirst({
            where: {
                id,
                userId
            },
            include: {
                tags: true
            }
        });

        if (!build) {
            throw new NotFoundException('Build not found');
        }

        const removedPhotos = build.photos.filter(
            (photo) => !data.photos!.includes(photo),
        );

        const filesToDelete = [...removedPhotos];

        if (
            build.schematicUrl &&
            build.schematicUrl !== data.schematicUrl
        ) {
            filesToDelete.push(build.schematicUrl);
        }

        if (data.tags) {
            await this.prisma.buildTag.deleteMany({
                where: {
                    buildId: build.id,
                },
            });

            await this.prisma.buildTag.createMany({
                data: data.tags.map((tagId) => ({
                    buildId: build.id,
                    tagId,
                })),
            });
        }

        await Promise.all(
            filesToDelete.map((key) => this.fileService.deleteFile(key))
        )

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

        if (!build) {
            throw new NotFoundException('Build not found');
        }

        const filesToDelete = [
            ...build.photos,
        ];

        if (build.schematicUrl) {
            filesToDelete.push(build.schematicUrl);
        }

        await Promise.all(
            filesToDelete.map((key) =>
                this.fileService.deleteFile(key),
            ),
        );

        return this.prisma.build.delete({
            where: {
                id
            }
        })
    }
}