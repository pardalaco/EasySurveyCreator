import { toaster } from "@/components/ui/toaster";
import { useState } from "react";

export default () => {
  const [options, setOptions] = useState<string[]>(["", ""]);
  const addOption = (): void => {
    if (options.length < 5) setOptions([...options, ""]);
    else {
      toaster.create({
        description: "The maximum number of options has been reached.",
        type: "warning",
      });
    }
  };

  const removeOption = (index: number): void => {
    const newOption = [...options];
    newOption.splice(index, 1);
    setOptions(newOption);
  };

  return { options, setOptions, addOption, removeOption };
};
