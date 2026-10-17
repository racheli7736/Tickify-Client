import type { UseFormRegisterReturn } from 'react-hook-form';

/**
 * Adapts React Hook Form's `register(...)` result to a MUI TextField: the `ref` must go to the real <input>
 * (via `inputRef`), otherwise "focus the first invalid field" cannot work.
 */
export function muiRegister({ ref, ...rest }: UseFormRegisterReturn) {
  return { inputRef: ref, ...rest };
}
