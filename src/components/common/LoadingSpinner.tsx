import { RefreshCw } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function LoadingSpinner({ size = "md", text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2 p-4">
      <RefreshCw className={`animate-spin text-muted-foreground ${sizeClasses[size]}`} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}
