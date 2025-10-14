import { FieldLabel } from '../ui/field';
import { getRadioGroupFieldId, useFieldContext } from './form-context';

export function FormRadioGroupFieldLabel({
  value,
  ...props
}: Omit<React.ComponentProps<typeof FieldLabel>, 'htmlFor'> & {
  value: string;
}) {
  const field = useFieldContext();
  return <FieldLabel htmlFor={getRadioGroupFieldId(field, value)} {...props} />;
}
