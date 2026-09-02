import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) { }

  async getCategories(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        skip,
        take: limit,
        orderBy: {
          name: 'asc',
        },
      }),
      this.prisma.category.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: categories,
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
