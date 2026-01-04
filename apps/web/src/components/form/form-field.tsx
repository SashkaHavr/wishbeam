import { Field } from "../ui/field";
import { useFieldContext } from "./form-context";

export function FormField(props: Omit<React.ComponentProps<typeof Field>, "data-invalid">) {
  const field = useFieldContext();
  return <Field data-invalid={!field.state.meta.isValid} {...props} />;
}
