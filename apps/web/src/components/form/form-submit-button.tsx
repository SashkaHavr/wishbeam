import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';
import { useFormContext } from './form-context';

export function FormSubmitButton(props: React.ComponentProps<typeof Button>) {
  const form = useFormContext();
  return (
    <form.Subscribe
      selector={(state) =>
        [state.canSubmit, state.isSubmitting, state.isDefaultValue] as const
      }
    >
      {([canSubmit, isSubmitting]) => {
        return (
          <Button type="submit" disabled={!canSubmit}>
            {isSubmitting && <Spinner />}
            <span>{props.children}</span>
          </Button>
        );
      }}
    </form.Subscribe>
  );
}
