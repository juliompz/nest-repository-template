import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUsuarioDto } from 'src/core/usuario/dto/create.usuario.dto';
import { RefreshAuthGuard } from './jwt/refresh-auth.guard';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';
import { Request } from 'express';
import { GoogleAuthGuard } from './jwt/google-auth.guard';
import { Paginate, PaginateQuery } from 'nestjs-paginate';

// Interface para tipagem do request com propriedade user
interface RequestWithUser extends Request {
  user: {
    userId: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  login(@Body() loginDto: { email: string; password: string }) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin() {}

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Req() req, @Res() res) {
    const userEmail = req.user.email;
    const { access_token, refresh_token } =
      await this.authService.loginWithGoogle(userEmail);

    return res.redirect(
      `http://localhost:3000/api/login/google?access_token=${access_token}&refresh_token=${refresh_token}`,
    );
  }

  @Post('/register')
  register(@Body() registerDto: CreateUsuarioDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(RefreshAuthGuard)
  @Post('/refresh')
  refresh(
    @Req() req: RequestWithUser,
    @Body() body: { refresh_token: string },
  ) {
    return this.authService.refresh({
      userId: req.user.userId,
      refreshToken: body.refresh_token,
    });
  }

  @Post('/register/confirm')
  confirmRegister(
    @Body() confirmRegistrationDto: { email: string; code: string },
  ) {
    return this.authService.confirmRegistration(
      confirmRegistrationDto.email,
      confirmRegistrationDto.code,
    );
  }

  @Post('/register/resend-email-confirmation')
  resendEmailConfirmation(
    @Body() resendEmailConfirmationDto: { email: string },
  ) {
    return this.authService.resendEmailConfirmation(
      resendEmailConfirmationDto.email,
    );
  }
}
