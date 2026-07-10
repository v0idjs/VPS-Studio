import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export function Tabs({ value, onValueChange, children, className = "" }: TabsProps) {
  return (
    <div className={className} data-value={value} data-on-value-change={onValueChange.toString()}>
      {children}
    </div>
  );
}

interface TabsListProps extends HTMLAttributes<HTMLDivElement> {}

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ className = "", ...props }, ref) => (
    <div
      ref={ref}
      className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`}
      {...props}
    />
  )
);
TabsList.displayName = "TabsList";

interface TabsTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  value: string;
  activeValue?: string;
}

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className = "", value, activeValue, ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        activeValue === value
          ? "bg-background text-foreground shadow-sm"
          : "hover:bg-background/50"
      } ${className}`}
      {...props}
    />
  )
);
TabsTrigger.displayName = "TabsTrigger";

interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className = "", value: _value, ...props }, ref) => (
    <div
      ref={ref}
      className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
      {...props}
    />
  )
);
TabsContent.displayName = "TabsContent";
