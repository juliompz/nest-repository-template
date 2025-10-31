import { BadRequestException } from '@nestjs/common';
import { ZodError } from 'zod';
import {
  CreateUsuarioSchema,
  CreateUsuarioSchemaType,
  UpdateUsuarioSchema,
  UpdateUsuarioSchemaType,
} from './usuario.schema';
import { getZodErrors } from 'src/utils/functions/get-zod-errors';

export class UsuarioValidator {
  public validateForCreate(data: CreateUsuarioSchemaType): void {
    try {
      CreateUsuarioSchema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException(getZodErrors(error));
      }
      throw error;
    }
  }

  public validateForUpdate(data: UpdateUsuarioSchemaType): void {
    try {
      UpdateUsuarioSchema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException(getZodErrors(error));
      }
      throw error;
    }
  }
}
