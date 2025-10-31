import { RoleEnum } from 'src/core/auth/RBAC/roles.enum';
import { ProviderEnum } from '../infra/model/usuario.model';

export interface CreateUsuarioDto {
  name: string;
  email: string;
  password: string;
  provider: ProviderEnum;

  isConfirmedUser: boolean;
  roles: RoleEnum[];
}

export interface OutputUsuarioDto {
  id: string;
  name: string;
  email: string;
  isConfirmedUser: boolean;
  roles: string[];
  provider: ProviderEnum;
}
