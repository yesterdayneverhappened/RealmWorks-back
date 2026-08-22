import { Injectable, NotFoundException, Param } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { PrismaService } from "prisma/prisma.service";

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}

    getUsers() {
        return this.prisma.user.findMany();
    }

    async getUser(id:string) {
        const user = await this.prisma.user.findUnique({ where: {id} });

        if (!user) {
            throw new NotFoundException()
        }

        return user;
    }

    deleteUser(id:string) {
        return this.prisma.user.delete({ where: {id} })
    }

    createUser(user:CreateUserDto) {
        return `Пользователь ${user.name} создан`
    }
}