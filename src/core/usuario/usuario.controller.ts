import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { RoleEnum } from 'src/core/auth/RBAC/roles.enum';
import { Roles } from 'src/core/auth/RBAC/roles.decorator';
import { RolesGuard } from 'src/core/auth/RBAC/roles.guard';
import { JwtAuthGuard } from 'src/core/auth/jwt/jwt-auth.guard';

@Controller('usuarios')
@UseGuards(JwtAuthGuard)
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  findAll(@Paginate() query: PaginateQuery) {
    return this.usuarioService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  getMe(@Req() req: any, @Paginate() query: PaginateQuery) {
    return this.usuarioService.findOne(req.user.userId, query);
  }
}
