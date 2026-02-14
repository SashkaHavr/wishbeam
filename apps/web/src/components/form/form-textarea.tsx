import { Textarea } from "../ui/textarea";
import { useFieldContext } from "./form-context";

export function FormTextarea(
  props: Omit<
    React.ComponentProps<typeof Textarea>,
    "id" | "name" | "value" | "onBlur" | "onChange" | "aria-invalid"
  >,
) {
  const field = useFieldContext<string>();
  return (
    <Textarea
      value={field.state.value}
      onBlur={field.handleBlur}
      onChange={(e) => field.handleChange(e.target.value)}
      {...props}
    />
  );
}
