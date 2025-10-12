import { InputGroupButton } from '../ui/input-group';
import { Spinner } from '../ui/spinner';
import { useFormContext } from './form-context';

export function FormInputGroupSubmitButton({
  children,
  ...props
}: React.ComponentProps<typeof InputGroupButton>) {
  const form = useFormContext();
  return (
    <form.Subscribe
      selector={(state) =>
        [state.canSubmit, state.isSubmitting, state.isDefaultValue] as const
      }
    >
      {([canSubmit, isSubmitting]) => {
        return (
          <InputGroupButton type="submit" disabled={!canSubmit} {...props}>
            {isSubmitting && <Spinner />}
            <span>{children}</span>
          </InputGroupButton>
        );
      }}
    </form.Subscribe>
  );
}
