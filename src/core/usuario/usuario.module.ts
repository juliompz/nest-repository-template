import { Module } from '@nestjs/common';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './infra/model/usuario.model';
import { FindOneUsuarioUseCase } from './usecases/findOne/findOne.usuario.usecase';
import { FindAllUsuarioUseCase } from './usecases/findAll/findAll.usuario.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  controllers: [UsuarioController],
  providers: [UsuarioService, FindOneUsuarioUseCase, FindAllUsuarioUseCase],
  exports: [TypeOrmModule, UsuarioService],
})
export class UsuarioModule {}
