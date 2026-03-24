import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserController } from './user/user.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AppController, UserController],
  providers: [AppService],
})
export class AppModule {}
