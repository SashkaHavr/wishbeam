import { Input } from '../ui/input';
import { useFieldContext } from './form-context';

export function FormInput(props: React.ComponentProps<typeof Input>) {
  const field = useFieldContext<string>();
  return (
    <Input
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
