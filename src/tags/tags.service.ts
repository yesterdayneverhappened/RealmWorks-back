import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";

@Injectable()
export class TagService {
  constructor(private readonly prisma: PrismaService) { }

  async getTags(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [tags, total] = await Promise.all([
      this.prisma.tag.findMany({
        skip,
        take: limit,
        orderBy: {
          name: 'asc',
        },
      }),
      this.prisma.tag.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: tags,
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