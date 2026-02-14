import type React from "react";

import { RadioGroupItem } from "../ui/radio-group";

export function FormRadioGroupItem({
  value,
  ...props
}: React.ComponentProps<typeof RadioGroupItem>) {
  return <RadioGroupItem value={value as string} {...props} />;
}
