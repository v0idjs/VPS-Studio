import { useState, useEffect } from "react";
import { RefreshCw, Search, Download, Trash2 } from "lucide-react";
import type { PackageInfo } from "@/lib/package-types";
import { list_packages, search_packages, install_package, remove_package } from "@/hooks/use-ipc";

interface PackageListProps {
  serverId: string;
}

export function PackageList({ serverId }: PackageListProps) {
  const [packages, setPackages] = useState<PackageInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"installed" | "search">("installed");
  const [selectedPackage, setSelectedPackage] = useState<PackageInfo | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadPackages();
  }, [serverId, searchMode]);

  async function loadPackages() {
    setLoading(true);
    try {
      if (searchMode === "installed") {
        const data = await list_packages({ server_id: serverId, filter: searchQuery || undefined });
        setPackages(data);
      } else {
        const data = await search_packages({ server_id: serverId, filter: searchQuery });
        setPackages(data);
      }
    } catch (error) {
      console.error("Failed to load packages:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleInstall(packageName: string) {
    setActionLoading(`install-${packageName}`);
    try {
      await install_package({ server_id: serverId, package_name: packageName });
      await loadPackages();
    } catch (error) {
      console.error("Failed to install package:", error);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRemove(packageName: string) {
    if (!confirm(`Remove ${packageName}?`)) return;
    setActionLoading(`remove-${packageName}`);
    try {
      await remove_package({ server_id: serverId, package_name: packageName });
      await loadPackages();
    } catch (error) {
      console.error("Failed to remove package:", error);
    } finally {
      setActionLoading(null);
    }
  }

  const filteredPackages = packages.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border p-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={searchMode === "installed" ? "Filter packages..." : "Search packages..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadPackages()}
            className="h-8 w-full rounded border border-input bg-background pl-8 pr-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <button
          onClick={() => setSearchMode("installed")}
          className={`rounded px-2 py-1 text-sm ${searchMode === "installed" ? "bg-accent" : "hover:bg-accent/50"}`}
        >
          Installed
        </button>
        <button
          onClick={() => setSearchMode("search")}
          className={`rounded px-2 py-1 text-sm ${searchMode === "search" ? "bg-accent" : "hover:bg-accent/50"}`}
        >
          Search
        </button>
        <button onClick={loadPackages} className="rounded p-1 hover:bg-accent" title="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {loading && packages.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No packages found</div>
        ) : (
          <div className="divide-y divide-border">
            <div className="sticky top-0 flex items-center bg-background px-4 py-2 text-xs font-medium text-muted-foreground">
              <span className="w-48">Package</span>
              <span className="w-32">Version</span>
              <span className="flex-1">Description</span>
              <span className="w-20">Actions</span>
            </div>
            {filteredPackages.map((pkg) => (
              <div
                key={pkg.name}
                onClick={() => setSelectedPackage(pkg)}
                className={`flex cursor-pointer items-center px-4 py-2 hover:bg-accent/50 ${
                  selectedPackage?.name === pkg.name ? "bg-accent" : ""
                }`}
              >
                <span className="w-48 truncate text-sm font-medium">{pkg.name}</span>
                <span className="w-32 truncate text-sm text-muted-foreground">{pkg.version}</span>
                <span className="flex-1 truncate text-sm text-muted-foreground">{pkg.description}</span>
                <div className="flex w-20 gap-1">
                  {searchMode === "search" ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleInstall(pkg.name); }}
                      disabled={actionLoading === `install-${pkg.name}`}
                      className="rounded p-1 text-muted-foreground hover:bg-green-500/10 hover:text-green-500 disabled:opacity-50"
                      title="Install"
                    >
                      <Download size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemove(pkg.name); }}
                      disabled={actionLoading === `remove-${pkg.name}`}
                      className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
        {filteredPackages.length} packages
        {selectedPackage && ` | Selected: ${selectedPackage.name}`}
      </div>
    </div>
  );
}
