import { useState, useEffect } from "react";
import {
  Folder,
  File,
  Home,
  RefreshCw,
  Search,
  ArrowLeft,
  ArrowUp,
} from "lucide-react";
import { listDirectory } from "@/hooks/use-ipc";
import type { FileInfo } from "@/lib/file-types";

interface FileExplorerProps {
  serverId: string;
  initialPath?: string;
  onFileSelect?: (file: FileInfo) => void;
  onFileDoubleClick?: (file: FileInfo) => void;
}

export function FileExplorer({
  serverId,
  initialPath = "/",
  onFileSelect,
  onFileDoubleClick,
}: FileExplorerProps) {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [history, setHistory] = useState<string[]>([initialPath]);
  const [historyIndex, setHistoryIndex] = useState(0);

  useEffect(() => {
    loadDirectory(currentPath);
  }, [serverId, currentPath]);

  async function loadDirectory(path: string) {
    setLoading(true);
    try {
      const data = await listDirectory(serverId, path);
      setFiles(data);
    } catch (error) {
      console.error("Failed to load directory:", error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }

  function handleNavigate(path: string) {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(path);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentPath(path);
  }

  function handleBack() {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentPath(history[historyIndex - 1]);
    }
  }

  function handleForward() {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentPath(history[historyIndex + 1]);
    }
  }

  function handleUp() {
    const parent = currentPath.split("/").slice(0, -1).join("/") || "/";
    handleNavigate(parent);
  }

  function handleHome() {
    handleNavigate("/home");
  }

  function handleFileClick(file: FileInfo) {
    setSelectedFile(file);
    onFileSelect?.(file);
  }

  function handleFileDoubleClick(file: FileInfo) {
    if (file.is_dir) {
      handleNavigate(file.path);
    } else {
      onFileDoubleClick?.(file);
    }
  }

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border p-2">
        <button
          onClick={handleBack}
          disabled={historyIndex === 0}
          className="rounded p-1 hover:bg-accent disabled:opacity-50"
        >
          <ArrowLeft size={16} />
        </button>
        <button onClick={handleForward} className="rounded p-1 hover:bg-accent">
          <ArrowUp size={16} className="rotate-90" />
        </button>
        <button onClick={handleUp} className="rounded p-1 hover:bg-accent">
          <ArrowUp size={16} />
        </button>
        <button onClick={handleHome} className="rounded p-1 hover:bg-accent">
          <Home size={16} />
        </button>
        <button
          onClick={() => loadDirectory(currentPath)}
          className="rounded p-1 hover:bg-accent"
        >
          <RefreshCw size={16} />
        </button>
        <div className="flex-1 rounded border border-input bg-background px-2 py-1 text-sm">
          {currentPath}
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 rounded border border-input bg-background pl-8 pr-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {searchQuery ? "No matching files" : "Empty directory"}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredFiles.map((file) => (
              <div
                key={file.path}
                onClick={() => handleFileClick(file)}
                onDoubleClick={() => handleFileDoubleClick(file)}
                className={`flex cursor-pointer items-center gap-3 px-4 py-2 hover:bg-accent/50 ${
                  selectedFile?.path === file.path ? "bg-accent" : ""
                }`}
              >
                {file.is_dir ? (
                  <Folder className="h-4 w-4 text-yellow-500" />
                ) : (
                  <File className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="flex-1 truncate text-sm">{file.name}</span>
                {!file.is_dir && (
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatDate(file.modified)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
        {filteredFiles.length} items
        {selectedFile && ` | Selected: ${selectedFile.name}`}
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString();
}
