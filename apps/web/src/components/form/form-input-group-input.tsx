import { InputGroupInput } from '../ui/input-group';
import { useFieldContext } from './form-context';

export function FormInputGroupInput(
  props: React.ComponentProps<typeof InputGroupInput>,
) {
  const field = useFieldContext<string>();
  return (
    <InputGroupInput
      id={field.name}
      name={field.name}
      value={field.state.value}
      onBlur={field.handleBlur}
      onChange={(e) => field.handleChange(e.target.value)}
      aria-invalid={!field.state.meta.isValid}
      {...props}
    />
  );
}
