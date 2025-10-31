import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../../infra/model/usuario.model';
import { OutputUsuarioDto } from '../../dto/create.usuario.dto';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';

@Injectable()
export class FindOneUsuarioUseCase {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async byId(id: string, query: PaginateQuery): Promise<Paginated<Usuario>> {
    return paginate(query, this.usuarioRepository, {
      where: { id },
      sortableColumns: ['id', 'email', 'name', 'roles', 'isConfirmedUser'],
      nullSort: 'last',
    });
  }
  async byEmail(email: string): Promise<OutputUsuarioDto> {
    return await this.usuarioRepository.findOne({
      where: { email },
    });
  }
}
