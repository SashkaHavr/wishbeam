import { Textarea } from '../ui/textarea';
import { getFieldId, useFieldContext } from './form-context';

export function FormTextarea(
  props: Omit<
    React.ComponentProps<typeof Textarea>,
    'id' | 'name' | 'value' | 'onBlur' | 'onChange' | 'aria-invalid'
  >,
) {
  const field = useFieldContext<string>();
  return (
    <Textarea
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
