import { FieldLabel } from '../ui/field';
import { useFieldContext } from './form-context';

export function FormFieldLabel(
  props: Omit<React.ComponentProps<typeof FieldLabel>, 'htmlFor'>,
) {
  const field = useFieldContext();
  return <FieldLabel htmlFor={field.name} {...props} />;
}
