import { Field, FieldDescription, FieldError, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useFieldContext } from './form-context';

export function FormField(props: React.ComponentProps<typeof Field>) {
  return <Field {...props} />;
}

export function FormFieldLabel(
  props: Omit<React.ComponentProps<typeof FieldLabel>, 'htmlFor'>,
) {
  const field = useFieldContext();
  return <FieldLabel htmlFor={field.name} {...props} />;
}

export function FormFieldDescription(
  props: React.ComponentProps<typeof FieldDescription>,
) {
  return <FieldDescription {...props} />;
}

export function FormFieldError(props: React.ComponentProps<typeof FieldError>) {
  const field = useFieldContext();
  if (field.state.meta.isValid) return;
  return <FieldError {...props} errors={field.state.meta.errors} />;
}

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
