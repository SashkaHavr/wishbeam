import { Button } from '../ui/button';
import { LoadingSpinner } from '../ui/loading-spinner';
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
            {isSubmitting && <LoadingSpinner className="size-4" />}
            <p>{props.children}</p>
            {isSubmitting && <div className="size-4" />}
          </Button>
        );
      }}
    </form.Subscribe>
  );
}
