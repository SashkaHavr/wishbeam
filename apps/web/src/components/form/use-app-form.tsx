import { createFormHook } from '@tanstack/react-form';

import {
  FormField,
  FormFieldDescription,
  FormFieldError,
  FormFieldLabel,
  FormInput,
  FormTextarea,
} from './field-components';
import { Form, FormSubmitButton } from './form-components';
import { fieldContext, formContext } from './form-context';

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    FormInput,
    FormFieldLabel,
    FormField,
    FormTextarea,
    FormFieldError,
    FormFieldDescription,
  },
  formComponents: { FormSubmitButton, Form },
});
