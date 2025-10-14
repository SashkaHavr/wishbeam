import { createFormHookContexts } from '@tanstack/react-form';

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

export function getFieldId(field: { name: string; form: { formId: string } }) {
  return `${field.form.formId}-${field.name}`;
}

export function getRadioGroupFieldId(
  field: { name: string; form: { formId: string } },
  value: string,
) {
  return `${getFieldId(field)}-${value}`;
}
