import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTodoDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Task Title' })
  title: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Brief Task Description' })
  description: string;
}

export class UpdateTodoDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'New title for task' })
  title?: string;
  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'New description for task' })
  description: string;
}

export class TodoDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Task Title' })
  title: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Brief Task Description' })
  description: string;
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: 'Id of the user that created this task' })
  ownerId: number;
  //   @ApiProperty({ description: 'Details about the owner' })
  //   user:;
}
