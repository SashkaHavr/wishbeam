import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';
import { useFormContext } from './form-context';

export function FormSubmitButton(
  props: React.ComponentProps<typeof Button> & { defaultInvalid?: boolean },
) {
  const form = useFormContext();
  return (
    <form.Subscribe
      selector={(state) =>
        [state.canSubmit, state.isSubmitting, state.isDefaultValue] as const
      }
    >
      {([canSubmit, isSubmitting, isDefaultValue]) => {
        return (
          <Button
            type="submit"
            disabled={!canSubmit || (isDefaultValue && props.defaultInvalid)}
          >
            {isSubmitting && <Spinner className="size-4" />}
            <span>{props.children}</span>
            {isSubmitting && <div className="size-4" />}
          </Button>
        );
      }}
    </form.Subscribe>
  );
}

export function Form(props: React.ComponentProps<'form'>) {
  const form = useFormContext();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      {...props}
    />
  );
}
