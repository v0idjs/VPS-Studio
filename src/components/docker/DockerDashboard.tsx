import { useState } from "react";
import { ContainerList } from "./ContainerList";
import { ImageList } from "./ImageList";

interface DockerDashboardProps {
  serverId: string;
}

export function DockerDashboard({ serverId }: DockerDashboardProps) {
  const [activeTab, setActiveTab] = useState<"containers" | "images">("containers");

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border p-2">
        <button
          onClick={() => setActiveTab("containers")}
          className={`rounded px-3 py-1 text-sm ${activeTab === "containers" ? "bg-accent" : "hover:bg-accent/50"}`}
        >
          Containers
        </button>
        <button
          onClick={() => setActiveTab("images")}
          className={`rounded px-3 py-1 text-sm ${activeTab === "images" ? "bg-accent" : "hover:bg-accent/50"}`}
        >
          Images
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === "containers" ? (
          <ContainerList serverId={serverId} />
        ) : (
          <ImageList serverId={serverId} />
        )}
      </div>
    </div>
  );
}
