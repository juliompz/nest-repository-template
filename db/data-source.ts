import { Usuario } from 'src/core/usuario/infra/model/usuario.model';
import { DataSourceOptions } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  schema: process.env.DATABASE_SCHEMA,
  entities: [Usuario],
  migrations: ['dist/db/migrations/**/*.js'],
  synchronize: true,
};
