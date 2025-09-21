import { createFormHook } from '@tanstack/react-form';

import { Form } from './form';
import { fieldContext, formContext } from './form-context';
import { FormFieldset } from './form-fieldset';
import { FormInput } from './form-input';
import { FormLabel } from './form-label';
import { FormSubmitButton } from './form-submit-button';

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    FormInput,
    FormLabel,
    FormFieldset,
  },
  formComponents: { FormSubmitButton, Form },
});
