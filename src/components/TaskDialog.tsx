import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Trash2 } from "lucide-react";
import type { Task } from "./TaskCard";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onSave: (task: Omit<Task, "id" | "order"> & { id?: string }) => void;
  onDelete?: (id: string) => void;
}

const tagOptions = ["Design", "Development", "Marketing", "Research"];

export function TaskDialog({ open, onOpenChange, task, onSave, onDelete }: TaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<string>("todo");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [tags, setTags] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [assignees, setAssignees] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setPriority(task.priority);
      setTags(task.tags);
      setProgress(task.progress);
      setAssignees(task.assignees.join(", "));
      setDueDate(task.due_date || "");
    } else {
      setTitle(""); setDescription(""); setStatus("todo"); setPriority("medium");
      setTags([]); setProgress(0); setAssignees(""); setDueDate("");
    }
  }, [task, open]);

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      ...(task ? { id: task.id } : {}),
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      tags,
      progress,
      assignees: assignees.split(",").map(a => a.trim()).filter(Boolean),
      due_date: dueDate || null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "New Task"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                  {/* Note: ideally we fetch these dynamically too, but for now we add 'done' */}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mt-1">
              {tagOptions.map(tag => (
                <button key={tag} onClick={() => toggleTag(tag)}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${tags.includes(tag) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Progress ({progress}%)</Label>
            <Slider value={[progress]} onValueChange={([v]) => setProgress(v)} min={0} max={100} step={5} className="mt-2" />
          </div>
          <div>
            <Label>Assignees (comma separated)</Label>
            <Input value={assignees} onChange={(e) => setAssignees(e.target.value)} placeholder="Alice, Bob" />
          </div>
          <div>
            <Label>Due Date</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div className="flex justify-between pt-2">
            {task && onDelete && (
              <Button variant="destructive" size="sm" onClick={() => { onDelete(task.id); onOpenChange(false); }}>
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleSave}>{task ? "Update" : "Create"}</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
