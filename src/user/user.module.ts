import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CreateUserDto, UserDto } from './dto';
import { UserService } from './user.service';

@Module({
  providers: [UserService, CreateUserDto, UserDto],
  imports: [PrismaModule],
  exports: [UserService, CreateUserDto, UserDto],
})
export class UserModule {}
