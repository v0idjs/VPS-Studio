import { forwardRef, type HTMLAttributes } from "react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/80"
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
}

export const DialogContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = "", children, ...props }, ref) => (
    <div
      ref={ref}
      className={`relative z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg sm:rounded-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);
DialogContent.displayName = "DialogContent";

export function DialogHeader({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`} {...props} />;
}

export function DialogTitle({ className = "", ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props} />;
}

export function DialogDescription({ className = "", ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={`text-sm text-muted-foreground ${className}`} {...props} />;
}

export function DialogFooter({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`} {...props} />;
}
