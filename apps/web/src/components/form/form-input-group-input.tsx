import { InputGroupInput } from "../ui/input-group";
import { getFieldId, useFieldContext } from "./form-context";

export function FormInputGroupInput(
  props: Omit<
    React.ComponentProps<typeof InputGroupInput>,
    "id" | "name" | "value" | "onBlur" | "onChange" | "aria-invalid"
  >,
) {
  const field = useFieldContext<string>();
  return (
    <InputGroupInput
      id={getFieldId(field)}
      name={field.name}
      value={field.state.value}
      onBlur={field.handleBlur}
      onChange={(e) => field.handleChange(e.target.value)}
      aria-invalid={!field.state.meta.isValid}
      {...props}
    />
  );
}
