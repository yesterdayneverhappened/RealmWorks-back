import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { CreateBuildDto } from "./dto/create-build.dto";

@Injectable()
export class BuildService {
    constructor (private readonly prisma: PrismaService) {}

    getBuilds() {
        return this.prisma.build.findMany();
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

    getBuild(id: string) {
        return this.prisma.build.findUnique({ 
            where: { id }
        })
    }

    async editBuild(id: string, userId: string, data: CreateBuildDto) {
        const build = await this.prisma.build.findFirst({
            where: {
                id,
                userId
            }
        });

        if(!build) {
            throw new NotFoundException('Build not found')
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
            throw new NotFoundException('Build not found')
        }

        return this.prisma.build.delete({
            where: {
                id
            }
        })
    }
}