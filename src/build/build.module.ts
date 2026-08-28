import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { BuildService } from './build.service';
import { BuildsController } from './buil.controller';

@Module({
  imports: [PrismaModule],
  controllers: [BuildsController],
  providers: [BuildService],
})
export class BuildModule {}
