import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsuarioModule } from 'src/core/usuario/usuario.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt/strategies/jwt.strategy';
import jwtConfig from './jwt/config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import refreshJwtConfig from './jwt/config/refresh-jwt.config';
import { RefreshJwtStrategy } from './jwt/strategies/refresh-jwt.strategy';
import { RedisModule } from '../../redis/redis.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { LoginUsecase } from './usecases/login.usecase';
import { RegisterUsecase } from './usecases/register.usecase';
import { SendEmailWhenUserRegisteredHandler } from './events/send-email-when-user-registered.handler';
import { EventDispatcher } from '../@shared/events/event.dispatcher';
import { UserRegisteredEvent } from './events/user-registered.event';
import googleConfig from './jwt/config/google.config';
import { GoogleStrategy } from './jwt/strategies/google.strategy';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbitmq:rabbitmq@localhost:5672'],
          queue: 'email_queue',
          exchange: 'email_exchange',
          exchangeType: 'direct',
          queueOptions: { durable: true },
        },
      },
    ]),
    UsuarioModule,
    PassportModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshJwtConfig),
    ConfigModule.forFeature(googleConfig),
    RedisModule,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshJwtStrategy,
    GoogleStrategy,
    LoginUsecase,
    RegisterUsecase,
    SendEmailWhenUserRegisteredHandler,
    {
      provide: 'EventDispatcher',
      useClass: EventDispatcher,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule implements OnModuleInit {
  constructor(
    @Inject('EventDispatcher')
    private readonly eventDispatcher: EventDispatcher,
    private readonly emailHandler: SendEmailWhenUserRegisteredHandler,
  ) {}

  onModuleInit() {
    this.eventDispatcher.register(UserRegisteredEvent.name, this.emailHandler);
  }
}
