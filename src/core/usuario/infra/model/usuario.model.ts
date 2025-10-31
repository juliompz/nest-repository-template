import { RoleEnum } from 'src/core/auth/RBAC/roles.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum ProviderEnum {
  GOOGLE = 'google',
  LOCAL = 'local',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  name: string;
  @Column({ unique: true })
  email: string;
  @Column()
  password: string;

  @Column('simple-array')
  roles: RoleEnum[];

  @Column({ default: false })
  isConfirmedUser: boolean;

  @Column({ enum: ProviderEnum })
  provider: ProviderEnum;
}
