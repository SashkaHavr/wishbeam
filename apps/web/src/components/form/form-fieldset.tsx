import { cn } from '~/lib/utils';

export function FormFieldset({
  className,
  ...props
}: React.ComponentProps<'fieldset'>) {
  return (
    <fieldset className={cn('flex flex-col gap-3', className)} {...props} />
  );
}
