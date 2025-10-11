import { FieldError } from '../ui/field';
import { useFieldContext } from './form-context';

export function FormFieldError(props: React.ComponentProps<typeof FieldError>) {
  const field = useFieldContext();
  return (
    !field.state.meta.isValid && (
      <FieldError {...props} errors={field.state.meta.errors} />
    )
  );
}
