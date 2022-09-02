import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateUserDto } from '../user/dto';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';

@ApiTags('/auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() newUserDto: CreateUserDto) {
    const a = await this.authService.signup(newUserDto);
    return a;
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signin(@Body() loginUserDto: LoginUserDto) {
    return this.authService.signin(loginUserDto);
  }
}
