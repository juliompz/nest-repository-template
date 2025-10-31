import { Injectable } from '@nestjs/common';

import { CreateUsuarioDto } from 'src/core/usuario/dto/create.usuario.dto';

import { RegisterUsecase } from './usecases/register.usecase';
import { LoginUsecase } from './usecases/login.usecase';

import { UsuarioService } from '../usuario/usuario.service';
import { PaginateQuery } from 'nestjs-paginate';

@Injectable()
export class AuthService {
  constructor(
    private readonly registerUsecase: RegisterUsecase,
    private readonly loginUsecase: LoginUsecase,
    private readonly usuarioService: UsuarioService,
  ) {}

  async register(usuario: CreateUsuarioDto) {
    return this.registerUsecase.register(usuario);
  }

  async confirmRegistration(email: string, code: string) {
    return this.registerUsecase.confirmRegistration(email, code);
  }

  async login(email: string, password: string) {
    return this.loginUsecase.signIn(email, password);
  }
  async loginWithGoogle(email: string) {
    return this.loginUsecase.signInWithGoogle(email);
  }

  async refresh({
    userId,
    refreshToken,
  }: {
    userId: string;
    refreshToken: string;
  }) {
    return this.loginUsecase.refresh({ userId, refreshToken });
  }

  async resendEmailConfirmation(email: string) {
    return this.registerUsecase.resendEmailConfirmation(email);
  }

  async validateGoogleUser(googleUser: CreateUsuarioDto) {
    const user = await this.usuarioService.findByEmail(googleUser.email);
    if (!user) {
      return this.registerUsecase.registerWithGoogle(googleUser);
    }
    return user;
  }
}
