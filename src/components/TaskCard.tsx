import { MoreHorizontal, Calendar, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: "low" | "medium" | "high";
  tags: string[];
  progress: number;
  assignees: string[];
  due_date: string | null;
  order: number;
}

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  dragHandleProps?: any;
}

const tagColors: Record<string, string> = {
  Design: "bg-primary/15 text-primary",
  Development: "bg-tag-dev/15 text-tag-dev",
  Marketing: "bg-tag-marketing/15 text-tag-marketing",
  Research: "bg-tag-research/15 text-tag-research",
};

const priorityColors: Record<string, string> = {
  high: "bg-priority-high/15 text-priority-high",
  medium: "bg-priority-medium/15 text-priority-medium",
  low: "bg-priority-low/15 text-priority-low",
};

const avatarColors = [
  "bg-primary text-primary-foreground",
  "bg-tag-dev text-primary-foreground",
  "bg-tag-marketing text-primary-foreground",
  "bg-tag-research text-primary-foreground",
];

export function TaskCard({ task, onEdit, dragHandleProps }: TaskCardProps) {
  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border border-border/50 hover:shadow-md transition-all animate-slide-in group cursor-pointer" onClick={() => onEdit(task)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div {...dragHandleProps} className="opacity-0 group-hover:opacity-60 transition-opacity cursor-grab">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full capitalize", priorityColors[task.priority])}>
            {task.priority}
          </span>
        </div>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); onEdit(task); }}>
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {task.tags.map((tag) => (
            <span key={tag} className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", tagColors[tag] || "bg-muted text-muted-foreground")}>
              {tag}
            </span>
          ))}
        </div>
      )}

      <h3 className="text-sm font-semibold text-card-foreground mb-1 line-clamp-2">{task.title}</h3>
      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.description}</p>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground font-medium">Progress</span>
          <span className="text-[10px] font-semibold text-foreground">{task.progress}%</span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${task.progress}%` }} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Assignees */}
        <div className="flex -space-x-1.5">
          {task.assignees.slice(0, 3).map((name, i) => (
            <div key={i} className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ring-2 ring-card", avatarColors[i % avatarColors.length])}>
              {name.charAt(0).toUpperCase()}
            </div>
          ))}
          {task.assignees.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold ring-2 ring-card text-muted-foreground">
              +{task.assignees.length - 3}
            </div>
          )}
        </div>

        {task.due_date && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </div>
        )}
      </div>
    </div>
  );
}
