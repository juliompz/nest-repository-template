import { ZodError } from 'zod';

export function getZodErrors(error: ZodError) {
  const errorMessages = error.issues.map((err) => err.message).join(', ');
  return errorMessages;
}
