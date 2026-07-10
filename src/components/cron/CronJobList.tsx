import { useState, useEffect } from "react";
import { RefreshCw, Plus, Trash2, Clock } from "lucide-react";
import type { CronJob } from "@/lib/cron-types";
import { list_cron_jobs, remove_cron_job } from "@/hooks/use-ipc";

interface CronJobListProps {
  serverId: string;
  onAddJob?: () => void;
  onEditJob?: (job: CronJob) => void;
}

export function CronJobList({ serverId, onAddJob, onEditJob }: CronJobListProps) {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<CronJob | null>(null);

  useEffect(() => {
    loadJobs();
  }, [serverId]);

  async function loadJobs() {
    setLoading(true);
    try {
      const data = await list_cron_jobs({ server_id: serverId });
      setJobs(data);
    } catch (error) {
      console.error("Failed to load cron jobs:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(job: CronJob) {
    if (!confirm(`Remove cron job: ${job.command}?`)) return;
    try {
      await remove_cron_job({ server_id: serverId, job_id: job.id });
      await loadJobs();
    } catch (error) {
      console.error("Failed to remove cron job:", error);
    }
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-2">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium">Cron Jobs</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadJobs} className="rounded p-1 hover:bg-accent" title="Refresh">
            <RefreshCw size={16} />
          </button>
          <button onClick={onAddJob} className="rounded p-1 hover:bg-accent" title="Add job">
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {loading && jobs.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No cron jobs</div>
        ) : (
          <div className="divide-y divide-border">
            <div className="sticky top-0 flex items-center bg-background px-4 py-2 text-xs font-medium text-muted-foreground">
              <span className="w-40">Schedule</span>
              <span className="flex-1">Command</span>
              <span className="w-20">Actions</span>
            </div>
            {jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                onDoubleClick={() => onEditJob?.(job)}
                className={`flex cursor-pointer items-center px-4 py-2 hover:bg-accent/50 ${
                  selectedJob?.id === job.id ? "bg-accent" : ""
                }`}
              >
                <span className="w-40 truncate text-sm font-mono">{job.schedule}</span>
                <span className="flex-1 truncate text-sm">{job.command}</span>
                <div className="flex w-20 gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemove(job); }}
                    className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
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
        {jobs.length} jobs
        {selectedJob && ` | Selected: ${selectedJob.command}`}
      </div>
    </div>
  );
}
