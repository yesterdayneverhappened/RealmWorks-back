import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  saltRounds = 11;

  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(login: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: login.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const { passwordHash, id } = user;

    const isPasswordMatch = await bcrypt.compare(login.password, passwordHash);

    if (!isPasswordMatch) {
      throw new UnauthorizedException();
    }

    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
      },
      {
        expiresIn: '30m'
      }
    );

    const refreshTocken = this.generateRefreshedToken();

    const refreshTokenHash = await bcrypt.hash(
      refreshTocken,
      this.saltRounds
    )

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash,
        expiresAt: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        )
      }
    });

    return {
      accessToken,
      refreshTocken
    }
  }

  private generateRefreshedToken() {
    return randomBytes(64).toString('hex')
  }

  async refresh(refreshTocken: string) {
    const [sessionId, secret] = refreshTocken.split('.')

    if(!sessionId || !secret) {
      throw new UnauthorizedException()
    }

    const session = await this.prisma.session.findUnique({
      where: {
        id: sessionId
      }
    })

    if(!session) {
      throw new UnauthorizedException()
    }

    if (session.expiresAt < new Date()) {
      await this.prisma.session.delete({
        where: {
          id: session.id,
        },
      })

      throw new UnauthorizedException()
    }

    const isValid = await bcrypt.compare(
      secret,
      session.refreshTokenHash
    );

    if(!isValid) {
      throw new UnauthorizedException();
    }

    const accessToken = this.jwtService.sign(
      {
        sub: session.userId,
      },
      {
        expiresIn: '30m',
      }
    );

    return { accessToken }
  }

  async logout(refreshToken: string) {
    const [sessionId] = refreshToken.split('.');

    if (!sessionId) {
      throw new UnauthorizedException();
    }

    const session = await this.prisma.session.findUnique({
      where: {
        id: sessionId,
      },
    })

    if(!session) {
      throw new UnauthorizedException()
    }

    await this.prisma.session.delete({
      where: {
        id: sessionId,
      },
    });

    return {
      message: 'Logged out successfully',
    };
  }

  async getSessions(userId: string) {
    return this.prisma.session.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        createdAt: true,
        expiresAt: true
      }
    })
  }
}
