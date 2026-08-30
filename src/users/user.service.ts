import { ConflictException, Injectable, NotFoundException, Param, UnauthorizedException } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { PrismaService } from "prisma/prisma.service";
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from "./dto/update-user.dto";
import { UpdatePasswordDto } from "./dto/update-password.dto";

@Injectable()
export class UserService {
    private readonly saltRounds = 11;

    constructor(private readonly prisma: PrismaService) { }

    getUsers() {
        return this.prisma.user.findMany();
    }

    async getUser(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },

            select: {
                id: true,
                name: true,
                avatarUrl: true,
            }
        });

        if (!user) {
            throw new NotFoundException();
        }

        return user;
    }

    async getUserBuilds(
        userId: string,
        page: number,
        limit: number,
    ) {
        const skip = (page - 1) * limit;

        const [builds, total] = await Promise.all([
            this.prisma.build.findMany({
                where: {
                    userId,
                },

                skip,
                take: limit,

                orderBy: {
                    createdAt: 'desc',
                },

                include: {
                    _count: {
                        select: {
                            likes: true,
                            comments: true,
                        },
                    },
                },
            }),

            this.prisma.build.count({
                where: {
                    userId,
                },
            }),
        ]);

        return {
            data: builds,

            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPreviousPage: page > 1,
            },
        };
    }

    deleteUser(id: string) {
        return this.prisma.user.delete({ where: { id } })
    }

    async createUser(user: CreateUserDto) {
        const passwordHash = await bcrypt.hash(
            user.password,
            this.saltRounds
        );

        try {
            return this.prisma.user.create({
                data: {
                    name: user.name,
                    email: user.email,
                    passwordHash,
                },
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            });
        } catch (e) {
            if (e.code === 'P2002') {
                throw new ConflictException('This email is already registered');
            }

            throw e;
        }
    }

    getMe(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                createdAt: true,
                updatedAt: true
            }
        })
    }

    async updateMe(id: string, data: UpdateUserDto) {
        return this.prisma.user.update({
            where: {
                id,
            },
            data: {
                name: data.name,
                avatarUrl: data.avatarUrl
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                createdAt: true,
                updatedAt: true
            }
        })
    }

    async updatePassword(id: string, dto: UpdatePasswordDto) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                passwordHash: true
            }
        });

        if (!user) {
            throw new NotFoundException()
        }

        const isPasswordMatch = await bcrypt.compare(
            dto.currentPassword,
            user.passwordHash
        );

        if (!isPasswordMatch) {
            throw new UnauthorizedException('Current password is incorrect')
        }

        const passwordHash = await bcrypt.hash(
            dto.newPassword,
            this.saltRounds
        )

        await this.prisma.user.update({
            where: { id },
            data: {
                passwordHash
            }
        })

        return {
            message: 'Password successfuly changed'
        }
    }
}
