import { cn } from '~/lib/utils';
import { FormField } from './form-field';
import { FormFieldError } from './form-field-error';
import { FormFieldLabel } from './form-field-label';
import { FormInput } from './form-input';
import { FormTextarea } from './form-textarea';
import { withForm } from './use-app-form';

export const WishlistFields = withForm({
  defaultValues: { title: '', description: '' },
  props: { className: '' } as { className?: string },
  render: function Render({ form, className }) {
    return (
      <div className={cn('flex flex-col gap-4', className)}>
        <form.AppField name="title">
          {() => (
            <FormField>
              <FormFieldLabel>Title</FormFieldLabel>
              <FormInput />
              <FormFieldError />
            </FormField>
          )}
        </form.AppField>
        <form.AppField name="description">
          {() => (
            <FormField>
              <FormFieldLabel>Description</FormFieldLabel>
              <FormTextarea />
              <FormFieldError />
            </FormField>
          )}
        </form.AppField>
      </div>
    );
  },
});
