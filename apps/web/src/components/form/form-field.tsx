import { Field } from '../ui/field';
import { useFieldContext } from './form-context';

export function FormField(props: React.ComponentProps<typeof Field>) {
  const field = useFieldContext();
  return <Field data-invalid={!field.state.meta.isValid} {...props} />;
}
