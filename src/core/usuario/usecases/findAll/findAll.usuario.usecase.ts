import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Usuario } from '../../infra/model/usuario.model';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FilterOperator,
  FilterSuffix,
  paginate,
  Paginated,
  PaginateQuery,
} from 'nestjs-paginate';

@Injectable()
export class FindAllUsuarioUseCase {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async execute(query: PaginateQuery): Promise<Paginated<Usuario>> {
    return paginate(query, this.usuarioRepository, {
      sortableColumns: ['id', 'email', 'name', 'roles', 'isConfirmedUser'],
      searchableColumns: [`name`, `email`, 'id', 'roles', 'isConfirmedUser'],
      filterableColumns: {
        name: [FilterOperator.EQ, FilterSuffix.NOT],
      },
      select: ['id', 'name', 'email', 'roles', 'isConfirmedUser', 'provider'],
      relations: [],
    });
  }
}
