import { CreateUsuarioDto } from '../../dto/create.usuario.dto';
import { UpdateUsuarioDto } from '../../dto/update.usuario.dto';
import { UsuarioEntity } from '../entity/usuario.entity';
import { v4 as uuid } from 'uuid';
import { UsuarioValidator } from '../validator/usuario.validator';

export class UsuarioFactory {
  public static create(usuario: CreateUsuarioDto): UsuarioEntity {
    const usuarioEntity = new UsuarioEntity(
      uuid(),
      usuario.name,
      usuario.email,
      usuario.password,
      usuario.provider,
      usuario.roles,
    );
    usuarioEntity.validateForCreate();

    return usuarioEntity;
  }

  public static update(id: string, usuario: UpdateUsuarioDto) {
    const usuarioEntity = new UsuarioEntity(
      id,
      usuario.name,
      usuario.email,
      usuario.password,
      usuario.provider,
      usuario.roles,
    );
    usuarioEntity.validateForUpdate();

    return usuarioEntity;
  }
}
