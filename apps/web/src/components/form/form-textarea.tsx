import { Textarea } from '../ui/textarea';
import { useFieldContext } from './form-context';

export function FormTextarea(props: React.ComponentProps<typeof Textarea>) {
  const field = useFieldContext<string>();
  return (
    <Textarea
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
