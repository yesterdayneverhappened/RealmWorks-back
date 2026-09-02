import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { TagController } from './tags.controller';
import { TagService } from './tags.service';

@Module({
  imports: [PrismaModule],
  controllers: [TagController],
  providers: [TagService],
})
export class TagModule { }
