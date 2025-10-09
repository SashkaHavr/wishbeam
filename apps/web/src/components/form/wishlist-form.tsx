import { createFormHook } from '@tanstack/react-form';

import {
  FormField,
  FormFieldError,
  FormFieldLabel,
  FormInput,
  FormTextarea,
} from './field-components';
import { Form, FormSubmitButton } from './form-components';
import { fieldContext, formContext } from './form-context';

export const { useAppForm: useWishlistForm, withForm: withWishlistForm } =
  createFormHook({
    fieldContext,
    formContext,
    fieldComponents: {
      FormInput,
      FormFieldLabel,
      FormField,
      FormTextarea,
      FormFieldError,
    },
    formComponents: { FormSubmitButton, Form },
  });
