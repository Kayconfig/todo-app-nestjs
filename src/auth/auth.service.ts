import {
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { compareSync } from 'bcrypt';
import { omit } from 'lodash';
import { CreateUserDto } from 'src/user/dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { hashSync } from 'bcrypt';
import { LoginUserDto } from './dto/';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}
  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.userService.findOne({ email });
      if (!user) {
        return null;
      }
      const verifyPass = compareSync(password, user.password);
      if (!verifyPass) {
        return null;
      }
      return omit(user, ['password']);
    } catch (err) {
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ['Unable to validate user, please try again later.'],
      });
    }
  }

  async signup(userDetails: CreateUserDto) {
    try {
      const userWithHashedPass = this.encryptPass(userDetails);
      return omit(await this.userService.createOne(userWithHashedPass), [
        'password',
        'updatedAt',
        'createdAt',
      ]);
    } catch (err) {
      if (err instanceof ForbiddenException) {
        throw err;
      }
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ['Unable to sign user up, please try again later.'],
      });
    }
  }

  async getUserFromDb(email: string) {
    try {
      return this.userService.findOne({ email });
    } catch (err) {
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ['Unable to get user from db, please try again later.'],
      });
    }
  }

  async signin(loginDetails: LoginUserDto) {
    try {
      const { email, password } = loginDetails;
      const { id: userId } = await this.validateUser(email, password);
      const token = await this.generateToken(email, userId);
      return { token };
    } catch (err) {
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ['Unable to sign user in, please try again later.'],
      });
    }
  }

  encryptPass(userDetails: CreateUserDto): CreateUserDto {
    try {
      const { password } = userDetails;
      userDetails.password = hashSync(
        password,
        +this.config.getOrThrow('SALT_ROUND'),
      );
      return userDetails;
    } catch (err) {
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ['Unable to encrypt password, please try again later.'],
      });
    }
  }

  async generateToken(email: string, userId: number) {
    try {
      return this.jwtService.sign(
        { email, userId },
        {
          secret: this.config.getOrThrow('JWT_SECRET'),
          expiresIn: '24h',
        },
      );
    } catch (err) {
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ['Unable to validate user, please try again later.'],
      });
    }
  }
}
