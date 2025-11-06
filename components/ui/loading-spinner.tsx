import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const spinnerVariants = cva("animate-spin", {
  variants: {
    size: {
      sm: "size-4",
      md: "size-6",
      lg: "size-8",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  /**
   * 스피너 크기 (sm, md, lg)
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * 스피너 색상 (Tailwind 클래스)
   * @default "text-primary"
   */
  className?: string;
}

function LoadingSpinner({
  className,
  size,
  ...props
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label="로딩 중"
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    >
      <Loader2 className={cn(spinnerVariants({ size }))} />
      <span className="sr-only">로딩 중...</span>
    </div>
  );
}

export { LoadingSpinner, spinnerVariants };

