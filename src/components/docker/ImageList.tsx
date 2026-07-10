import { useState, useEffect } from "react";
import { RefreshCw, Search, Trash2 } from "lucide-react";
import type { DockerImage } from "@/lib/docker-types";
import { list_docker_images, docker_remove_image } from "@/hooks/use-ipc";

interface ImageListProps {
  serverId: string;
}

export function ImageList({ serverId }: ImageListProps) {
  const [images, setImages] = useState<DockerImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState<DockerImage | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadImages();
  }, [serverId]);

  async function loadImages() {
    setLoading(true);
    try {
      const data = await list_docker_images({ server_id: serverId });
      setImages(data);
    } catch (error) {
      console.error("Failed to load images:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(imageName: string) {
    if (!confirm(`Remove image ${imageName}?`)) return;
    setActionLoading(`remove-${imageName}`);
    try {
      await docker_remove_image({ server_id: serverId, image_name: imageName });
      await loadImages();
    } catch (error) {
      console.error("Failed to remove image:", error);
    } finally {
      setActionLoading(null);
    }
  }

  const filteredImages = images.filter((img) =>
    img.repository.toLowerCase().includes(searchQuery.toLowerCase()) ||
    img.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border p-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter images..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-full rounded border border-input bg-background pl-8 pr-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <button onClick={loadImages} className="rounded p-1 hover:bg-accent" title="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {loading && images.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No images found</div>
        ) : (
          <div className="divide-y divide-border">
            <div className="sticky top-0 flex items-center bg-background px-4 py-2 text-xs font-medium text-muted-foreground">
              <span className="w-40">Repository</span>
              <span className="w-32">Tag</span>
              <span className="w-24">ID</span>
              <span className="w-40">Created</span>
              <span className="w-24">Size</span>
              <span className="w-20">Actions</span>
            </div>
            {filteredImages.map((image) => (
              <div
                key={image.id}
                onClick={() => setSelectedImage(image)}
                className={`flex cursor-pointer items-center px-4 py-2 hover:bg-accent/50 ${
                  selectedImage?.id === image.id ? "bg-accent" : ""
                }`}
              >
                <span className="w-40 truncate text-sm">{image.repository}</span>
                <span className="w-32 truncate text-sm text-muted-foreground">{image.tag}</span>
                <span className="w-24 truncate text-sm text-muted-foreground">{image.id}</span>
                <span className="w-40 text-sm text-muted-foreground">{image.created}</span>
                <span className="w-24 text-sm text-muted-foreground">{image.size}</span>
                <div className="flex w-20 gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemove(`${image.repository}:${image.tag}`); }}
                    disabled={actionLoading === `remove-${image.repository}:${image.tag}`}
                    className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                    title="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
        {filteredImages.length} images
        {selectedImage && ` | Selected: ${selectedImage.repository}:${selectedImage.tag}`}
      </div>
    </div>
  );
}
