import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { GetUser } from '../auth/decorator';
import { JwtAuthGuard } from '../auth/jwt-guard.guard';
import { CreateTodoDto, TodoDto, UpdateTodoDto } from './dto';
import { TodoService } from './todo.service';

@UseGuards(JwtAuthGuard)
@ApiTags('/todos')
@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}
  @Post()
  async createTodo(
    @Body() todoDto: CreateTodoDto,
    @GetUser('id') ownerId: number,
  ): Promise<TodoDto> {
    return this.todoService.createTodo(todoDto, ownerId);
  }

  @Get()
  async getAllTodos(@GetUser('id') ownerId: number): Promise<TodoDto[]> {
    return this.todoService.getTodos(ownerId);
  }

  @Patch(':todoId')
  async updateTodoById(
    @Body() dto: UpdateTodoDto,
    @GetUser('id') ownerId: number,
    @Param('todoId', ParseIntPipe) todoId: number,
  ) {
    return this.todoService.updateTodoById(dto, ownerId, todoId);
  }

  @Get(':todoId')
  async getTodoById(
    @Param('todoId', ParseIntPipe) todoId: number,
    @GetUser('id') ownerId: number,
  ): Promise<TodoDto> {
    return this.todoService.getTodoById(todoId, ownerId);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':todoId')
  async deleteTodoById(
    @Param('todoId', ParseIntPipe) todoId: number,
    @GetUser('id') ownerId: number,
  ): Promise<void> {
    return this.todoService.deleteTodoById(todoId, ownerId);
  }
}
