import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CreateUserDto, UserDto } from '../user/dto';
import { AuthService } from './auth.service';
import {
  NotFoundDto,
  BadRequestDto,
  LoginSuccessDto,
  LoginUserDto,
} from './dto/auth-user.dto';

@ApiTags('v1/auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiCreatedResponse({
    description: 'User signed up successfully.',
    type: UserDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid or missing sign up details.',
  })
  @ApiForbiddenResponse({
    description: 'Failed attempt to sign up with existing Email.',
  })
  signup(@Body() newUserDto: CreateUserDto): Promise<UserDto> {
    return this.authService.signup(newUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'user signed in successfully',
    type: LoginSuccessDto,
  })
  @ApiBadRequestResponse({
    description: 'Missing or invalid Login details',
    type: BadRequestDto,
  })
  @ApiNotFoundResponse({
    description: 'user email does not exist in records',
    type: NotFoundDto,
  })
  @Post('signin')
  signin(@Body() loginUserDto: LoginUserDto): Promise<LoginSuccessDto> {
    return this.authService.signin(loginUserDto);
  }
}
