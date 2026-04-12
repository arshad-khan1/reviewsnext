import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Optional helper text to display below the input
   */
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, helperText, ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:border-indigo-500 focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
            className
          )}
          ref={ref}
          {...props}
        />
        {helperText && (
          <p className="text-[10px] text-muted-foreground font-medium px-1 uppercase tracking-wider">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
