import { ConflictException, Injectable, NotFoundException, Param } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { PrismaService } from "prisma/prisma.service";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    private readonly saltRounds = 11

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
}