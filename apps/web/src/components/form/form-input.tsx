import { Input } from '../ui/input';
import { getFieldId, useFieldContext } from './form-context';

export function FormInput(
  props: Omit<
    React.ComponentProps<typeof Input>,
    'id' | 'name' | 'value' | 'onBlur' | 'onChange' | 'aria-invalid'
  >,
) {
  const field = useFieldContext<string>();
  return (
    <Input
      id={getFieldId(field)}
      name={field.name}
      value={field.state.value}
      onBlur={field.handleBlur}
      onChange={(e) => field.handleChange(e.target.value)}
      aria-invalid={!field.state.meta.isValid}
      {...props}
    />
  );
}
