import { Wifi, WifiOff, HelpCircle } from "lucide-react";

export function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "online":
      return <Wifi className="h-4 w-4 text-green-500" />;
    case "offline":
      return <WifiOff className="h-4 w-4 text-red-500" />;
    default:
      return <HelpCircle className="h-4 w-4 text-yellow-500" />;
  }
}
