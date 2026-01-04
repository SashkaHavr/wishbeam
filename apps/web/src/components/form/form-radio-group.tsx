import type React from "react";

import { RadioGroup } from "../ui/radio-group";
import { getFieldId, useFieldContext } from "./form-context";

export function FormRadioGroup(
  props: Omit<React.ComponentProps<typeof RadioGroup>, "id" | "name" | "value" | "onValueChange">,
) {
  const field = useFieldContext<string>();
  return (
    <RadioGroup
      id={getFieldId(field)}
      name={field.name}
      value={field.state.value}
      onValueChange={(value) => field.handleChange(value as string)}
      {...props}
    />
  );
}
