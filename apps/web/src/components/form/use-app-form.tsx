import { createFormHook } from '@tanstack/react-form';

import { Form } from './form';
import { fieldContext, formContext } from './form-context';
import { FormFieldset } from './form-fieldset';
import { FormInput } from './form-input';
import { FormLabel } from './form-label';
import { FormSubmitButton } from './form-submit-button';
import { FormTextarea } from './form-textarea';

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    FormInput,
    FormLabel,
    FormFieldset,
    FormTextarea,
  },
  formComponents: { FormSubmitButton, Form },
});
