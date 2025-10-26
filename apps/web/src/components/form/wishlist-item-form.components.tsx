import { XIcon } from 'lucide-react';

import { cn } from '~/lib/utils';
import { Button } from '../ui/button';
import {
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from '../ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from '../ui/input-group';
import { FormField } from './form-field';
import { FormFieldError } from './form-field-error';
import { FormFieldLabel } from './form-field-label';
import { FormInput } from './form-input';
import { FormInputGroupInput } from './form-input-group-input';
import { withForm } from './use-app-form';

export const WishlistItemFields = withForm({
  defaultValues: { title: '', description: '', links: [] as string[] },
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
              <FormInput />
              <FormFieldError />
            </FormField>
          )}
        </form.AppField>
        <form.AppField name="links" mode="array">
          {(field) => (
            <FieldSet className="gap-4">
              <FieldLegend variant="label">Links</FieldLegend>
              <FieldDescription>
                Add links related to this item.
              </FieldDescription>
              <FieldGroup className="gap-4">
                {field.state.value.map((_, index) => (
                  <form.AppField key={index} name={`links[${index}]`}>
                    {() => (
                      <FormField orientation="horizontal">
                        <FieldContent>
                          <InputGroup>
                            <FormInputGroupInput placeholder="https://example.com/" />
                            <InputGroupAddon align="inline-end">
                              <InputGroupButton
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => field.removeValue(index)}
                                aria-label={`Remove link ${index + 1}`}
                              >
                                <XIcon />
                              </InputGroupButton>
                            </InputGroupAddon>
                          </InputGroup>
                          <FormFieldError />
                        </FieldContent>
                      </FormField>
                    )}
                  </form.AppField>
                ))}
                {field.state.value.length < 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      field.pushValue('');
                      setTimeout(() => {
                        const newField = document.querySelector(
                          `input[name="links[${field.state.value.length - 1}]"]`,
                        );
                        if (newField instanceof HTMLInputElement) {
                          newField.focus();
                        }
                      }, 0);
                    }}
                  >
                    Add Link
                  </Button>
                )}
              </FieldGroup>
            </FieldSet>
          )}
        </form.AppField>
      </div>
    );
  },
});
