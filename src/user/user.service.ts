import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from '../prisma/prisma.service';
import { FindOneUserDto } from './dto';
import { CreateUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async findOne(findOneUserDto: FindOneUserDto): Promise<User> {
    const user = await this.prismaService.user.findFirst({
      where: {
        ...findOneUserDto,
      },
    });
    if (!user) {
      throw new NotFoundException({ errorMsg: 'User not found' });
    }
    return user;
  }

  async createOne(newUserDto: CreateUserDto): Promise<User> {
    try {
      return await this.prismaService.user.create({
        data: newUserDto,
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ForbiddenException({
          errorMsg: (error.meta.target as Array<string>).map(
            (field) => `${field} is already in use`,
          ),
        });
      }

      throw new InternalServerErrorException({
        errorMsg: 'Unable to process signup request, please try again.',
      });
    }
  }
}
