import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.RMQ,
  //   options: {
  //     urls: ['amqp://rabbitmq:rabbitmq@localhost:5672'],
  //     queue: 'main_queue',
  //     queueOptions: { durable: true },
  //   },
  // });
  // await app.startAllMicroservices();
  app.enableCors();
  await app.listen(3001);
}
bootstrap();
