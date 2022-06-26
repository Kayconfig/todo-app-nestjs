import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoDto, TodoDto, UpdateTodoDto } from './dto';

@Injectable()
export class TodoService {
  constructor(private readonly prismaService: PrismaService) {}

  createTodo(newTodoDto: CreateTodoDto, ownerId: number): Promise<TodoDto> {
    try {
      const createTodoPayload = { ...newTodoDto, ownerId };
      console.log('>>>> createTodoPayload', createTodoPayload);
      return this.prismaService.todo.create({
        data: createTodoPayload,
      });
    } catch (err) {
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Unable to create todo, please try again later.',
      });
    }
  }
  async getTodoById(todoId: number, ownerId: number): Promise<TodoDto> {
    try {
      const todo = await this.prismaService.todo.findUnique({
        where: {
          userTodoId: { id: todoId, ownerId },
        },
        rejectOnNotFound: true,
      });
      return todo;
    } catch (err) {
      if (
        err instanceof PrismaClientKnownRequestError &&
        err.code === 'P2001'
      ) {
        throw new NotFoundException({
          status: HttpStatus.NOT_FOUND,
          message: 'Todo not found',
        });
      }
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Unable to get todo by id, please try again later.',
      });
    }
  }
  async getTodos(ownerId: number): Promise<TodoDto[]> {
    try {
      return await this.prismaService.todo.findMany({ where: { ownerId } });
    } catch (err) {
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Unable to get all todos, please try again later',
      });
    }
  }
  async updateTodoById(
    dto: UpdateTodoDto,
    ownerId: number,
    todoId: number,
  ): Promise<TodoDto> {
    try {
      return await this.prismaService.todo.update({
        where: {
          userTodoId: {
            id: todoId,
            ownerId,
          },
        },
        data: dto,
      });
    } catch (err) {
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Unable to update todo by id, please try again later.',
      });
    }
  }
  async deleteTodoById(ownerId: number, todoId) {
    try {
      await this.prismaService.todo.delete({
        where: {
          userTodoId: {
            id: todoId,
            ownerId,
          },
        },
      });
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Unable to delete todo by id, please try again later.',
      });
    }
  }
}
