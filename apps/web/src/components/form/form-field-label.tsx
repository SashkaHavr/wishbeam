import { FieldLabel } from "../ui/field";
import { getFieldId, useFieldContext } from "./form-context";

export function FormFieldLabel(props: Omit<React.ComponentProps<typeof FieldLabel>, "htmlFor">) {
  const field = useFieldContext();
  return <FieldLabel htmlFor={getFieldId(field)} {...props} />;
}
