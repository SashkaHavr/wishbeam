import type React from 'react';

import { RadioGroupItem } from '../ui/radio-group';
import { getRadioGroupFieldId, useFieldContext } from './form-context';

export function FormRadioGroupItem({
  value,
  ...props
}: React.ComponentProps<typeof RadioGroupItem>) {
  const field = useFieldContext();
  return (
    <RadioGroupItem
      value={value}
      id={getRadioGroupFieldId(field, value)}
      aria-invalid={!field.state.meta.isValid}
      {...props}
    />
  );
}
