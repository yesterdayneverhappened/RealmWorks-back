import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import * as bcrypt from 'bcrypt';
import { LoginDto } from "./dto/login.dto";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService, private jwtService: JwtService) {}

    async login (login: LoginDto) {
        const user = await this.prisma.user.findUnique(
            { where: {
                email: login.email
            }, select: {
                id: true,
                name: true,
                email: true,
                passwordHash: true
            }});

        if(!user) {
            throw new UnauthorizedException()
        }

        const { passwordHash, id } = user;

        const isPasswordMatch = await bcrypt.compare(login.password, passwordHash);

        if(isPasswordMatch){
            return {
                accessTocken: this.jwtService.sign({ sub: id })
            };
        } else {
            throw new UnauthorizedException()
        }
    }
}