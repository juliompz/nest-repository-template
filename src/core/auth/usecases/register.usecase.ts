import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  ProviderEnum,
  Usuario,
} from 'src/core/usuario/infra/model/usuario.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from 'src/redis/redis.service';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUsuarioDto } from 'src/core/usuario/dto/create.usuario.dto';
import * as bcrypt from 'bcrypt';
import { UsuarioFactory } from 'src/core/usuario/domain/factory/usuario.factory';
import { EventDispatcher } from 'src/core/@shared/events/event.dispatcher';
import { UserRegisteredEvent } from '../events/user-registered.event';

@Injectable()
export class RegisterUsecase {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @Inject('EventDispatcher')
    private readonly eventDispatcher: EventDispatcher,

    private readonly redisService: RedisService,
  ) {}
  private readonly saltRounds = 10; // quantidade de rounds para a criptografia

  async register(data: CreateUsuarioDto): Promise<{ message: string }> {
    const usuario = UsuarioFactory.create(data);
    const usuarioExists = await this.usuarioRepository.findOne({
      where: { email: data.email },
    });

    if (usuarioExists) {
      throw new HttpException('Email já cadastrado', HttpStatus.CONFLICT);
    }
    const hashedPassword = await this.hashPassword(usuario.password);

    await this.usuarioRepository.save({
      email: usuario.email,
      name: usuario.name,
      roles: usuario.roles,
      id: usuario.id,
      isConfirmedUser: usuario.isConfirmedUser,
      password: hashedPassword,
    });

    await this.sendEmail({ email: usuario.email, username: usuario.name });

    return { message: 'Cadastro realizado com sucesso' };
  }

  async registerWithGoogle(googleUser: CreateUsuarioDto) {
    const usuario = UsuarioFactory.create(googleUser);
    const usuarioExists = await this.usuarioRepository.findOne({
      where: { email: googleUser.email },
    });

    if (usuarioExists) {
      throw new HttpException('Email já cadastrado', HttpStatus.CONFLICT);
    }

    await this.usuarioRepository.save({
      email: usuario.email,
      name: usuario.name,
      roles: usuario.roles,
      provider: usuario.provider,
      id: usuario.id,
      isConfirmedUser: usuario.isConfirmedUser,
      password: '',
    });

    return { message: 'Cadastro realizado com sucesso' };
  }

  async resendEmailConfirmation(email: string) {
    const usuario = await this.usuarioRepository.findOne({
      where: { email },
    });

    if (!usuario) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }

    if (usuario.isConfirmedUser) {
      throw new HttpException('Usuário já confirmado', HttpStatus.CONFLICT);
    }

    await this.sendEmail({ email: usuario.email, username: usuario.name });

    return { message: 'Código de confirmação reenviado com sucesso' };
  }

  async confirmRegistration(email: string, code: string) {
    const usuario = await this.usuarioRepository.findOne({
      where: { email },
    });

    if (!usuario) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }

    if (usuario.isConfirmedUser) {
      throw new HttpException('Usuário já confirmado', HttpStatus.CONFLICT);
    }

    const storedCode = await this.redisService.get(code);

    if (!storedCode) {
      throw new HttpException(
        'Código de confirmação inválido',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (storedCode !== email) {
      throw new HttpException(
        'Código de confirmação inválido',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.usuarioRepository.update(usuario.id, { isConfirmedUser: true });

    return { message: 'Cadastro confirmado com sucesso' };
  }

  private async sendEmail({
    email,
    username,
  }: {
    email: string;
    username: string;
  }) {
    const userRegisteredEvent = new UserRegisteredEvent({
      to: email,
      subject: 'Confirmar cadastro',
      username: username,
    });
    this.eventDispatcher.notify(userRegisteredEvent);
  }

  // Método para criptografar a senha
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds); // Criptografa a senha
  }
}
