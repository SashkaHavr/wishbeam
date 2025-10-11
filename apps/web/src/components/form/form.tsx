import { useFormContext } from './form-context';

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
