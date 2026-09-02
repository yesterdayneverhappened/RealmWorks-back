import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './users/user.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BuildModule } from './build/build.module';
import { FilesModule } from './files/files.module';
import { TagModule } from './tags/tags.module';
import { CategoryModule } from './categories/categories.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    BuildModule,
    TagModule,
    CategoryModule,
    FilesModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
