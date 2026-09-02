import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Input } from "./input";
import { Button } from "./button";

interface PasswordInputProps extends Omit<
  React.ComponentProps<typeof Input>,
  "type"
> {
  showLabel?: string;
  hideLabel?: string;
}

export function PasswordInput({
  showLabel = "Show password",
  hideLabel = "Hide password",
  className,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className={`pr-10 ${className ?? ""}`}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
        aria-label={visible ? hideLabel : showLabel}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  );
}
