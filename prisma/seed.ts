import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

const categories = [
  {
    name: 'Medieval',
    slug: 'medieval',
  },
  {
    name: 'Modern',
    slug: 'modern',
  },
  {
    name: 'Fantasy',
    slug: 'fantasy',
  },
  {
    name: 'Japanese',
    slug: 'japanese',
  },
  {
    name: 'Sci-Fi',
    slug: 'sci-fi',
  },
  {
    name: 'Redstone',
    slug: 'redstone',
  },
  {
    name: 'City',
    slug: 'city',
  },
  {
    name: 'Nature',
    slug: 'nature',
  },
  {
    name: 'Interior',
    slug: 'interior',
  },
  {
    name: 'Other',
    slug: 'other',
  },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: {
        slug: category.slug,
      },
      update: {},
      create: category,
    });
  }

  console.log('Categories seeded successfully');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });