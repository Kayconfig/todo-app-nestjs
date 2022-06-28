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
import { ApiCreatedResponse, ApiHeader, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../auth/decorator';
import { JwtAuthGuard } from '../auth/jwt-guard.guard';
import { CreateTodoDto, TodoDto, UpdateTodoDto } from './dto';
import { TodoService } from './todo.service';

@UseGuards(JwtAuthGuard)
@ApiTags('v1/todos')
@ApiHeader({
  name: 'Authorization',
  description: 'Jwt token for authorization.',
})
@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}
  @Post()
  @ApiCreatedResponse({
    description: 'Todo created successfully.',
    type: TodoDto,
  })
  createTodo(
    @Body() todoDto: CreateTodoDto,
    @GetUser('id') ownerId: number,
  ): Promise<TodoDto> {
    return this.todoService.createTodo(todoDto, ownerId);
  }

  @Get()
  getAllTodos(@GetUser('id') ownerId: number): Promise<TodoDto[]> {
    return this.todoService.getTodos(ownerId);
  }

  @Patch(':todoId')
  updateTodoById(
    @Body() dto: UpdateTodoDto,
    @GetUser('id') ownerId: number,
    @Param('todoId', ParseIntPipe) todoId: number,
  ) {
    return this.todoService.updateTodoById(dto, ownerId, todoId);
  }

  @Get(':todoId')
  getTodoById(
    @Param('todoId', ParseIntPipe) todoId: number,
    @GetUser('id') ownerId: number,
  ): Promise<TodoDto> {
    return this.todoService.getTodoById(todoId, ownerId);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':todoId')
  deleteTodoById(
    @Param('todoId', ParseIntPipe) todoId: number,
    @GetUser('id') ownerId: number,
  ): Promise<void> {
    return this.todoService.deleteTodoById(todoId, ownerId);
  }
}
