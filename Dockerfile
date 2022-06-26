FROM node:14
WORKDIR /app
COPY . .
EXPOSE 3001
CMD ['yarn', 'start:dev']