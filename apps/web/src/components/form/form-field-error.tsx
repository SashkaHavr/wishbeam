import { FieldError } from '../ui/field';
import { useFieldContext } from './form-context';

export function FormFieldError(
  props: Omit<React.ComponentProps<typeof FieldError>, 'errors'>,
) {
  const field = useFieldContext();
  return (
    !field.state.meta.isValid && (
      <FieldError errors={field.state.meta.errors} {...props} />
    )
  );
}
