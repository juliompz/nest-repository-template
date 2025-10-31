import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from 'db/data-source';
import { UsuarioModule } from './core/usuario/usuario.module';
import { AuthModule } from './core/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    UsuarioModule,
    TypeOrmModule.forRootAsync({ useFactory: () => dataSourceOptions }),
    AuthModule,
    RedisModule,
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
  ],
})
export class AppModule {}
