import { z } from 'zod';
import { RoleEnum } from 'src/core/auth/RBAC/roles.enum';
import { ProviderEnum } from '../../infra/model/usuario.model';

// Schema para a criação de um usuário
export const CreateUsuarioSchema = z
  .object({
    name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres.'),
    email: z.email('O e-mail fornecido é inválido.'),
    password: z.string().optional(),
    // .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula.')
    // .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula.')
    // .regex(/[0-9]/, 'A senha deve conter pelo menos um número.')
    // .regex(/[\W_]/, 'A senha deve conter pelo menos um caractere especial.')
    roles: z
      .array(z.enum(RoleEnum))
      .min(1, 'O usuário deve ter pelo menos um cargo.'),
    provider: z.enum(ProviderEnum),
  })
  .superRefine((data, ctx) => {
    if (data.provider === ProviderEnum.LOCAL) {
      if (!data.password) {
        ctx.addIssue({
          code: 'custom',
          message: 'A senha é obrigatória quando o provider é LOCAL.',
          path: ['password'],
        });
        return;
      }
      if (data.password.length < 8) {
        ctx.addIssue({
          code: 'custom',
          message: 'A senha deve ter no mínimo 8 caracteres.',
          path: ['password'],
        });
      }
    }
  });

// Schema para a atualização de um usuário (geralmente mais flexível)
export const UpdateUsuarioSchema = z.object({
  name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres.').optional(),
  email: z.email('O e-mail fornecido é inválido.').optional(),
  password: z
    .string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres.')
    .optional(),
  roles: z
    .array(z.enum(RoleEnum))
    .min(1, 'O usuário deve ter pelo menos um cargo.')
    .optional(),
});

// Exportando os tipos inferidos para uso no DTO e em outros lugares
export type CreateUsuarioSchemaType = z.infer<typeof CreateUsuarioSchema>;
export type UpdateUsuarioSchemaType = z.infer<typeof UpdateUsuarioSchema>;
