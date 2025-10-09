import { cn } from '~/lib/utils';
import { withWishlistForm } from './wishlist-form';

export const WishlistFields = withWishlistForm({
  defaultValues: { title: '', description: '' },
  props: { className: '' } as { className?: string },
  render: function Render({ form, className }) {
    return (
      <div className={cn('flex flex-col gap-4', className)}>
        <form.AppField name="title">
          {(field) => (
            <field.FormField>
              <field.FormFieldLabel>Title</field.FormFieldLabel>
              <field.FormInput />
              <field.FormFieldError />
            </field.FormField>
          )}
        </form.AppField>
        <form.AppField name="description">
          {(field) => (
            <field.FormField>
              <field.FormFieldLabel>Description</field.FormFieldLabel>
              <field.FormTextarea />
              <field.FormFieldError />
            </field.FormField>
          )}
        </form.AppField>
      </div>
    );
  },
});
