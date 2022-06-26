import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @ApiProperty()
  email: string;
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  password: string;
}

export class LoginSuccessDto {
  @ApiProperty()
  token: string;
}

export class BadRequestDto {
  @ApiProperty({ default: HttpStatus.BAD_REQUEST })
  statusCode: number;
  @ApiProperty({ type: Array<string>, default: ['detailed error message'] })
  message: Array<string>;
  @ApiProperty({ default: 'Bad Request' })
  error?: string;
}

export class NotFoundDto {
  @ApiProperty({ default: HttpStatus.NOT_FOUND })
  statusCode: number;
  @ApiProperty({ type: Array<string>, default: ['detailed error message'] })
  message: Array<string>;
  @ApiProperty({ default: 'Not Found' })
  error?: string;
}
