import { Injectable } from '@nestjs/common';
import { OutputUsuarioDto } from './dto/create.usuario.dto';
import { FindOneUsuarioUseCase } from './usecases/findOne/findOne.usuario.usecase';
import { FindAllUsuarioUseCase } from './usecases/findAll/findAll.usuario.usecase';
import { Paginated, PaginateQuery } from 'nestjs-paginate';
import { Usuario } from './infra/model/usuario.model';

@Injectable()
export class UsuarioService {
  constructor(
    private readonly findOneUsuarioUseCase: FindOneUsuarioUseCase,
    private readonly findAllUsuarioUseCase: FindAllUsuarioUseCase,
  ) {}

  public async findOne(
    id: string,
    query: PaginateQuery,
  ): Promise<Paginated<Usuario>> {
    return await this.findOneUsuarioUseCase.byId(id, query);
  }

  public async findAll(query: PaginateQuery) {
    return await this.findAllUsuarioUseCase.execute(query);
  }

  public async findByEmail(email: string): Promise<OutputUsuarioDto> {
    return await this.findOneUsuarioUseCase.byEmail(email);
  }
}
