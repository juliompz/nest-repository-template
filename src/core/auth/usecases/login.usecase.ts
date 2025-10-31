import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from 'src/core/usuario/infra/model/usuario.model';
import { RedisService } from 'src/redis/redis.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import refreshJwtConfig from '../jwt/config/refresh-jwt.config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LoginUsecase {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,

    @Inject(refreshJwtConfig.KEY)
    private readonly refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
  ) {}

  // Método para comparar a senha fornecida com a senha criptografada
  private async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword); // Compara as senhas
  }

  async signIn(
    email: string,
    password: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const usuario = await this.usuarioRepository.findOne({
      where: { email },
    });

    if (!usuario) {
      throw new HttpException(
        'Email ou senha inválidos',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isPasswordValid = await this.comparePasswords(
      password,
      usuario.password,
    );

    if (!usuario || !isPasswordValid) {
      throw new HttpException(
        'Email ou senha inválidos',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!usuario.isConfirmedUser) {
      throw new HttpException(
        'Usuário não confirmou email',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const { access_token, refresh_token } = this.generateTokens(usuario);

    return {
      access_token,
      refresh_token,
    };
  }

  async signInWithGoogle(
    email: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const usuario = await this.usuarioRepository.findOne({
      where: { email },
    });

    if (!usuario) {
      throw new HttpException('Email não encontrado', HttpStatus.UNAUTHORIZED);
    }

    const { access_token, refresh_token } = this.generateTokens(usuario);

    return {
      access_token,
      refresh_token,
    };
  }

  private generateTokens(usuario: Usuario) {
    const payload = {
      sub: usuario.id,
      email: usuario.email,
      roles: usuario.roles,
      name: usuario.name,
      isConfirmedUser: usuario.isConfirmedUser,
    };

    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(
      payload,
      this.refreshTokenConfig,
    );

    // Salvar o refresh token no Redis com o userId como chave
    // TTL configurado para o mesmo tempo de expiração do refresh token (1 dia em segundos)
    const refreshTokenTTL = 1 * 24 * 60 * 60; // 1 dia em segundos
    this.redisService.set(usuario.id, refresh_token, refreshTokenTTL);

    return {
      access_token,
      refresh_token,
    };
  }

  async refresh({
    userId,
    refreshToken,
  }: {
    userId: string;
    refreshToken: string;
  }) {
    // Verificar se o refresh token é válido
    const verifiedRefreshToken = await this.jwtService.verify(refreshToken);

    // Verifica se o usuário que está tentando atualizar o token é o mesmo que o token foi gerado
    if (verifiedRefreshToken.sub !== userId) {
      throw new UnauthorizedException('Token inválido');
    }

    // Verifica se o token expirou
    if (verifiedRefreshToken.exp < Date.now() / 1000) {
      throw new UnauthorizedException('Token expirado');
    }

    // Verifica se o token é válido no Redis
    const storedRefreshToken = await this.redisService.get(userId);

    if (!storedRefreshToken) {
      throw new UnauthorizedException('Token não encontrado');
    }

    if (storedRefreshToken !== refreshToken) {
      throw new UnauthorizedException('Token inválido');
    }

    const payload = {
      sub: userId,
      email: verifiedRefreshToken.email,
      roles: verifiedRefreshToken.roles,
      nome: verifiedRefreshToken.nome,
    };

    const newAccessToken = this.jwtService.sign(payload);
    const newRefreshToken = this.jwtService.sign(
      payload,
      this.refreshTokenConfig,
    );

    // Atualizar o refresh token no Redis
    const refreshTokenTTL = 1 * 24 * 60 * 60; // 1 dia em segundos
    await this.redisService.set(userId, newRefreshToken, refreshTokenTTL);

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    };
  }
}
