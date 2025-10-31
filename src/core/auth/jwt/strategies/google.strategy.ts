import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import googleConfig from '../config/google.config';
import { ConfigType } from '@nestjs/config';
import { AuthService } from '../../auth.service';
import { RoleEnum } from '../../RBAC/roles.enum';
import { ProviderEnum } from 'src/core/usuario/infra/model/usuario.model';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(googleConfig.KEY)
    private readonly googleConfiguration: ConfigType<typeof googleConfig>,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: googleConfiguration.clientID,
      clientSecret: googleConfiguration.clientSecret,
      callbackURL: googleConfiguration.callbackURL,
      scope: ['profile', 'email'],
    });
  }

  async validate(
    access_token: string,
    refresh_token: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const user = await this.authService.validateGoogleUser({
      email: profile.emails[0].value,
      name: profile.name.givenName,
      roles: [RoleEnum.USER],
      password: '',
      provider: ProviderEnum.GOOGLE,
      isConfirmedUser: true,
    });
    done(null, user);
  }
}
