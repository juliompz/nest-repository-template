import { RoleEnum } from 'src/core/auth/RBAC/roles.enum';
import { UsuarioValidator } from '../validator/usuario.validator';
import { ProviderEnum } from '../../infra/model/usuario.model';

export class UsuarioEntity {
  private _id: string;
  private _name: string;
  private _email: string;
  private _password: string;
  private _roles: RoleEnum[];
  private _isConfirmedUser: boolean = false;
  private _provider: ProviderEnum;

  constructor(
    id: string,
    name: string,
    email: string,
    password: string,
    provider: ProviderEnum,
    roles: RoleEnum[],
  ) {
    this._id = id;
    this._name = name;
    this._email = email;
    this._password = password;
    this._provider = provider;
    this._roles = roles;
  }

  validateForCreate() {
    return new UsuarioValidator().validateForCreate(this);
  }

  validateForUpdate(validator: UsuarioValidator) {
    validator.validateForUpdate({
      name: this._name,
      email: this._email,
      password: this._password,
      roles: this._roles,
    });
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get email(): string {
    return this._email;
  }

  get password(): string {
    return this._password;
  }

  get roles(): RoleEnum[] {
    return this._roles;
  }

  get isConfirmedUser(): boolean {
    return this._isConfirmedUser;
  }

  get provider(): ProviderEnum {
    return this._provider;
  }

  set provider(provider: ProviderEnum) {
    this._provider = provider;
  }

  set name(name: string) {
    this._name = name;
  }

  set email(email: string) {
    this._email = email;
  }
}
