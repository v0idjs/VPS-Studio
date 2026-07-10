import { useState } from "react";
import { X, Save } from "lucide-react";
import { add_cron_job, remove_cron_job } from "@/hooks/use-ipc";

interface CronJobFormProps {
  serverId: string;
  editJob?: { id: string; schedule: string; command: string } | null;
  onClose: () => void;
  onSave?: () => void;
}

export function CronJobForm({ serverId, editJob, onClose, onSave }: CronJobFormProps) {
  const [schedule, setSchedule] = useState(editJob?.schedule || "");
  const [command, setCommand] = useState(editJob?.command || "");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!schedule || !command) return;
    
    setLoading(true);
    try {
      if (editJob) {
        await remove_cron_job({ server_id: serverId, job_id: editJob.id });
      }
      await add_cron_job({ server_id: serverId, schedule, command });
      onSave?.();
      onClose();
    } catch (error) {
      console.error("Failed to save cron job:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{editJob ? "Edit Cron Job" : "Add Cron Job"}</h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-accent">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm">Schedule</label>
            <input
              type="text"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              placeholder="*/5 * * * *"
              className="w-full rounded border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Format: minute hour day month weekday (e.g., "0 2 * * *" for 2 AM daily)
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm">Command</label>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="/usr/bin/backup.sh"
              className="w-full rounded border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded border border-input px-4 py-2 text-sm hover:bg-accent"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!schedule || !command || loading}
            className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Save size={14} />
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
