import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import { AppModule } from './../src/app.module';
import * as lodash from 'lodash';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    //get prisma service
    prismaService = app.get(PrismaService);
    //clean test database
    prismaService.cleandb();

    app.listen(3333);
  });

  afterAll(async () => {
    await app.close();
  });

  const validUserDetails = {
    email: 'test@email.com',
    password: 'testpassword',
    fullname: 'John Doe',
    phone: '07063287847',
  };
  const apiUrl = `http://localhost:3333`;
  let validUserId: number;
  describe('/auth', () => {
    const baseUrl = `${apiUrl}/auth`;
    describe('/signup', () => {
      const signupUrl = `${baseUrl}/signup`;
      const fieldsToOmit = ['email', 'password', 'fullname', 'phone'];
      const matchingDataforMissingFields = fieldsToOmit.map((field) => {
        return lodash.omit(validUserDetails, [field]);
      });

      test('should allow valid email and password', () => {
        return pactum
          .spec()
          .post(signupUrl)
          .withBody(validUserDetails)
          .expectStatus(HttpStatus.CREATED)
          .expect((ctx) => {
            const { id } = ctx.res.body;
            validUserId = id;
          })
          .stores('userId', 'id');
      });

      test('should throw 403 for duplicate email', () => {
        return pactum
          .spec()
          .post(signupUrl)
          .withBody(validUserDetails)
          .expectStatus(HttpStatus.FORBIDDEN);
      });

      fieldsToOmit.forEach((field, index) => {
        test(`should throw 400 for missing ${field}`, () => {
          const body = matchingDataforMissingFields[index];
          return pactum
            .spec()
            .post(signupUrl)
            .withBody(body)
            .expectStatus(HttpStatus.BAD_REQUEST);
        });
      });
    });

    describe('/signin', () => {
      const signInUrl = `${baseUrl}/signin`;
      const validLogin = lodash.pick(validUserDetails, ['email', 'password']);
      test('should allow user signin', () => {
        return pactum
          .spec()
          .post(signInUrl)
          .withBody(validLogin)
          .expectStatus(HttpStatus.OK)
          .expectBodyContains('token')
          .stores('token', 'token');
      });

      const fieldsToOmit = ['email', 'password'];
      const dataMatchingOmittedField = fieldsToOmit.map((field) =>
        lodash.omit(validLogin, [field]),
      );
      fieldsToOmit.forEach((field, index) => {
        test(`should not allow missing ${field}`, () => {
          const dataWithOmittedField = dataMatchingOmittedField[index];
          return pactum
            .spec()
            .post(signInUrl)
            .withBody(dataWithOmittedField)
            .expectStatus(HttpStatus.BAD_REQUEST);
        });
      });
    });
  });

  describe('/todos', () => {
    const todoDetails = {
      title: 'Dont forget to write test',
      description: 'A good note for great developers.',
    };
    const baseUrl = `${apiUrl}/todos`;
    describe('create', () => {
      const createUrl = `${baseUrl}`;

      it('should not allow unauthorized user to create todo', () => {
        return pactum
          .spec()
          .post(createUrl)
          .withBody(todoDetails)
          .expectStatus(HttpStatus.UNAUTHORIZED);
      });
      it('should allow authorized user to create todo', () => {
        return pactum
          .spec()
          .post(createUrl)
          .withHeaders('Authorization', 'Bearer $S{token}')
          .withBody(todoDetails)
          .expectStatus(HttpStatus.CREATED)
          .stores('todoId', 'id');
      });
    });

    describe('update', () => {
      const updateUrl = `${baseUrl}`;
      const updateTodoData = {
        title: 'Updated title',
        description: 'Update description',
      };

      it('should not allow unauthorized user to update todo', () => {
        return pactum
          .spec()
          .patch(updateUrl + `/$S{todoId}`)
          .withBody(updateTodoData)
          .expectStatus(HttpStatus.UNAUTHORIZED);
      });
      it('should allow authorized user to update todo', () => {
        return pactum
          .spec()
          .patch(updateUrl + `/$S{todoId}`)
          .withHeaders('Authorization', 'Bearer $S{token}')
          .withBody(updateTodoData)
          .expectStatus(HttpStatus.OK)
          .expect((context) => {
            const { title, description } = context.res.body;
            expect(title).toBe(updateTodoData.title);
            expect(description).toBe(updateTodoData.description);
          });
      });
    });

    describe('get', () => {
      const getTodoUrl = `${baseUrl}`;
      const updateTodoData = {
        title: 'Updated title',
        description: 'Update description',
      };

      it('should allow authorized user to get todo id', () => {
        return pactum
          .spec()
          .get(getTodoUrl + `/$S{todoId}`)
          .withHeaders('Authorization', 'Bearer $S{token}')
          .withBody(updateTodoData)
          .expectStatus(HttpStatus.OK)
          .expect((context) => {
            const { title, description } = context.res.body;
            expect(title).toBe(updateTodoData.title);
            expect(description).toBe(updateTodoData.description);
          });
      });

      it('should allow authorized user to get todo id', () => {
        return pactum
          .spec()
          .get(getTodoUrl)
          .withHeaders('Authorization', 'Bearer $S{token}')
          .withBody(updateTodoData)
          .expectStatus(HttpStatus.OK)
          .expect((context) => {
            const body = context.res.body;
            expect(body).toBeInstanceOf(Array);
            expect(body.length).toBe(1);
          });
      });

      it('should not allow unauthorized user to get todo by id', () => {
        return pactum
          .spec()
          .get(getTodoUrl + `/$S{todoId}`)
          .expectStatus(HttpStatus.UNAUTHORIZED);
      });

      it('should not allow unauthorized user to get all todos', () => {
        return pactum
          .spec()
          .get(getTodoUrl)
          .expectStatus(HttpStatus.UNAUTHORIZED);
      });
    });

    describe('delete', () => {
      const deleteUrl = `${baseUrl}`;
      it('should not allow unauthorized user to delete todo', () => {
        return pactum
          .spec()
          .delete(deleteUrl + `/$S{todoId}`)
          .expectStatus(HttpStatus.UNAUTHORIZED);
      });
      it('should allow authorized user to delete todo', () => {
        return pactum
          .spec()
          .delete(deleteUrl + `/$S{todoId}`)
          .withHeaders('Authorization', 'Bearer $S{token}')
          .expectStatus(HttpStatus.NO_CONTENT);
      });
    });
  });
});
