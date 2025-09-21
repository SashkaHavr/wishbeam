import { Label } from '../ui/label';
import { useFieldContext } from './form-context';

export function FormLabel(props: React.ComponentProps<typeof Label>) {
  const field = useFieldContext();
  return <Label htmlFor={field.name} {...props} />;
}
