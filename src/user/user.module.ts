import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CreateUserDto } from './dto';
import { UserService } from './user.service';

@Module({
  providers: [UserService, CreateUserDto],
  imports: [PrismaModule],
  exports: [UserService, CreateUserDto],
})
export class UserModule {}
