import { useState } from "react";
import { Search, Download } from "lucide-react";
import { search_packages, install_package } from "@/hooks/use-ipc";
import type { PackageInfo } from "@/lib/package-types";

interface PackageSearchProps {
  serverId: string;
  onInstall?: (packageName: string) => void;
}

export function PackageSearch({ serverId, onInstall }: PackageSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PackageInfo[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await search_packages({ server_id: serverId, filter: query });
      setResults(data);
    } catch (error) {
      console.error("Failed to search packages:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleInstall(packageName: string) {
    try {
      await install_package({ server_id: serverId, package_name: packageName });
      onInstall?.(packageName);
    } catch (error) {
      console.error("Failed to install package:", error);
    }
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border p-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search packages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="h-8 w-full rounded border border-input bg-background pl-8 pr-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          Search
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">Searching...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {query ? "No packages found" : "Enter a search query"}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {results.map((pkg) => (
              <div key={pkg.name} className="flex items-center px-4 py-2 hover:bg-accent/50">
                <div className="flex-1">
                  <div className="text-sm font-medium">{pkg.name}</div>
                  <div className="text-xs text-muted-foreground">{pkg.description}</div>
                </div>
                <span className="mr-2 text-xs text-muted-foreground">{pkg.version}</span>
                <button
                  onClick={() => handleInstall(pkg.name)}
                  className="rounded p-1 text-muted-foreground hover:bg-green-500/10 hover:text-green-500"
                  title="Install"
                >
                  <Download size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
        {results.length} results
      </div>
    </div>
  );
}
