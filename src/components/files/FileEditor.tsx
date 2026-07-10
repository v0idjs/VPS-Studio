import { useState, useEffect } from "react";
import { Save, X, RefreshCw } from "lucide-react";
import { readFile as readFileApi, writeFile as writeFileApi } from "@/hooks/use-ipc";

interface FileEditorProps {
  serverId: string;
  filePath: string;
  onClose: () => void;
  onSave?: () => void;
}

export function FileEditor({ serverId, filePath, onClose, onSave }: FileEditorProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modified, setModified] = useState(false);

  useEffect(() => {
    loadFile();
  }, [serverId, filePath]);

  async function loadFile() {
    setLoading(true);
    try {
      const data = await readFileApi({ server_id: serverId, source_path: filePath });
      setContent(data);
      setModified(false);
    } catch (error) {
      console.error("Failed to load file:", error);
      setContent("Error loading file");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await writeFileApi({ server_id: serverId, path: filePath, content });
      setModified(false);
      onSave?.();
    } catch (error) {
      console.error("Failed to save file:", error);
    } finally {
      setSaving(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value);
    setModified(true);
  }

  const fileName = filePath.split("/").pop() || filePath;

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{fileName}</span>
          {modified && <span className="text-xs text-yellow-500">*</span>}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={loadFile}
            className="rounded p-1 hover:bg-accent"
            title="Reload"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={handleSave}
            disabled={!modified || saving}
            className="rounded p-1 hover:bg-accent disabled:opacity-50"
            title="Save"
          >
            <Save size={16} />
          </button>
          <button onClick={onClose} className="rounded p-1 hover:bg-accent" title="Close">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <textarea
            value={content}
            onChange={handleChange}
            className="h-full w-full resize-none border-none bg-background p-4 font-mono text-sm focus:outline-none"
            spellCheck={false}
          />
        )}
      </div>

      <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
        {filePath} | {content.split("\n").length} lines
      </div>
    </div>
  );
}
