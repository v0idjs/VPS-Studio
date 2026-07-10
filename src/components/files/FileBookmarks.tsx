import { useState, useEffect } from "react";
import { Bookmark, BookmarkPlus, Trash2 } from "lucide-react";
import { getFileBookmarks as getFileBookmarksApi, addFileBookmark as addFileBookmarkApi, removeFileBookmark as removeFileBookmarkApi } from "@/hooks/use-ipc";
import type { FileBookmark } from "@/lib/file-types";

interface FileBookmarksProps {
  serverId: string;
  onBookmarkSelect?: (path: string) => void;
}

export function FileBookmarks({ serverId, onBookmarkSelect }: FileBookmarksProps) {
  const [bookmarks, setBookmarks] = useState<FileBookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBookmark, setNewBookmark] = useState({ path: "", name: "" });

  useEffect(() => {
    loadBookmarks();
  }, [serverId]);

  async function loadBookmarks() {
    setLoading(true);
    try {
      const data = await getFileBookmarksApi(serverId);
      setBookmarks(data);
    } catch (error) {
      console.error("Failed to load bookmarks:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddBookmark() {
    if (!newBookmark.path || !newBookmark.name) return;
    try {
      const bookmark = await addFileBookmarkApi({
        server_id: serverId,
        path: newBookmark.path,
        name: newBookmark.name,
      });
      setBookmarks([...bookmarks, bookmark]);
      setNewBookmark({ path: "", name: "" });
      setShowAddForm(false);
    } catch (error) {
      console.error("Failed to add bookmark:", error);
    }
  }

  async function handleRemoveBookmark(id: number) {
    try {
      await removeFileBookmarkApi(id);
      setBookmarks(bookmarks.filter((b) => b.id !== id));
    } catch (error) {
      console.error("Failed to remove bookmark:", error);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-3">
        <h3 className="font-medium">Bookmarks</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="rounded p-1 hover:bg-accent"
        >
          <BookmarkPlus size={16} />
        </button>
      </div>

      {showAddForm && (
        <div className="border-b border-border p-3">
          <input
            type="text"
            placeholder="Path (e.g., /var/log)"
            value={newBookmark.path}
            onChange={(e) => setNewBookmark({ ...newBookmark, path: e.target.value })}
            className="mb-2 w-full rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <input
            type="text"
            placeholder="Name"
            value={newBookmark.name}
            onChange={(e) => setNewBookmark({ ...newBookmark, name: e.target.value })}
            className="mb-2 w-full rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button
            onClick={handleAddBookmark}
            className="w-full rounded bg-primary px-2 py-1 text-sm text-primary-foreground hover:bg-primary/90"
          >
            Add Bookmark
          </button>
        </div>
      )}

      <div className="max-h-[300px] overflow-auto">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground">Loading...</div>
        ) : bookmarks.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">No bookmarks</div>
        ) : (
          <div className="divide-y divide-border">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="flex items-center gap-2 px-3 py-2 hover:bg-accent/50"
              >
                <Bookmark className="h-4 w-4 text-muted-foreground" />
                <button
                  onClick={() => onBookmarkSelect?.(bookmark.path)}
                  className="flex-1 text-left"
                >
                  <div className="text-sm font-medium">{bookmark.name}</div>
                  <div className="text-xs text-muted-foreground">{bookmark.path}</div>
                </button>
                <button
                  onClick={() => handleRemoveBookmark(bookmark.id)}
                  className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-destructive"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
