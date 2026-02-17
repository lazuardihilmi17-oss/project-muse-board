import { useState, useEffect, useCallback } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Plus, Search, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { KanbanColumn } from "@/components/KanbanColumn";
import { TaskDialog } from "@/components/TaskDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Task } from "@/components/TaskCard";

type Column = {
  id: string;
  title: string;
  order: number;
};

export default function KanbanPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newStatus, setNewStatus] = useState<string>("todo");
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    // Fetch columns
    const { data: cols, error: colsError } = await supabase
      .from("kanban_columns")
      .select("*")
      .order("order", { ascending: true });

    if (colsError) {
      toast({ title: "Error loading columns", description: colsError.message, variant: "destructive" });
    } else {
      setColumns(cols || []);
    }

    // Fetch tasks
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("order", { ascending: true });

    if (error) {
      toast({ title: "Error loading tasks", description: error.message, variant: "destructive" });
      return;
    }
    setTasks(
      (data || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description || "",
        status: t.status,
        priority: t.priority as "low" | "medium" | "high",
        tags: t.tags || [],
        progress: t.progress || 0,
        assignees: t.assignees || [],
        due_date: t.due_date,
        order: t.order || 0,
      }))
    );
  }, [toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    const updated = [...tasks];
    const taskIndex = updated.findIndex(t => t.id === draggableId);
    if (taskIndex === -1) return;

    const task = { ...updated[taskIndex] };
    task.status = destination.droppableId;
    updated.splice(taskIndex, 1);

    // Find insertion point
    const destTasks = updated.filter(t => t.status === destination.droppableId);
    const insertIndex = destination.index;
    const globalInsert = insertIndex < destTasks.length
      ? updated.indexOf(destTasks[insertIndex])
      : updated.length;
    updated.splice(globalInsert, 0, task);

    // Reorder
    updated.forEach((t, i) => (t.order = i));
    setTasks(updated);

    await supabase.from("tasks").update({ status: task.status, order: task.order }).eq("id", task.id);
  };

  const handleSave = async (taskData: Omit<Task, "id" | "order"> & { id?: string }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (taskData.id) {
      const { error } = await supabase.from("tasks").update({
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        tags: taskData.tags,
        progress: taskData.progress,
        assignees: taskData.assignees,
        due_date: taskData.due_date,
      }).eq("id", taskData.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      const { error } = await supabase.from("tasks").insert({
        user_id: user.id,
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        tags: taskData.tags,
        progress: taskData.progress,
        assignees: taskData.assignees,
        due_date: taskData.due_date,
        order: tasks.length,
      });
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    fetchData();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    fetchData();
  };

  const handleAddColumn = async () => {
    if (!newColumnTitle.trim()) return;
    const id = newColumnTitle.toLowerCase().replace(/\s+/g, '-');
    const { error } = await supabase.from("kanban_columns").insert({
      id,
      title: newColumnTitle,
      order: columns.length
    });

    if (error) {
      toast({ title: "Error adding column", description: error.message, variant: "destructive" });
    } else {
      setNewColumnTitle("");
      fetchData();
    }
  };

  const handleDeleteColumn = async (id: string) => {
    // Prevent deleting if tasks exist in this column
    const hasTasks = tasks.some(t => t.status === id);
    if (hasTasks) {
      toast({ title: "Cannot delete column", description: "Please move or delete tasks in this column first.", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("kanban_columns").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting column", description: error.message, variant: "destructive" });
    } else {
      fetchData();
    }
  };

  const filtered = tasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = (status: string) => {
    setEditingTask(null);
    setNewStatus(status);
    setDialogOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto overflow-x-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and track your tasks</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="pl-9 w-full md:w-56 bg-card"
            />
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              placeholder="New Column..."
              className="w-32 md:w-40"
            />
            <Button variant="outline" size="icon" onClick={handleAddColumn} disabled={!newColumnTitle.trim()}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 pb-4 overflow-x-auto min-h-[calc(100vh-200px)]">
          {columns.map(col => (
            <div key={col.id} className="min-w-[300px] flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <span className="font-semibold text-sm text-muted-foreground">{col.title}</span>
                {/* Only allow deleting if it's not one of the core columns if we wanted to enforce that, but for now allow all if empty */}
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteColumn(col.id)}>
                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
              <KanbanColumn
                id={col.id}
                title={col.title}
                tasks={filtered.filter(t => t.status === col.id)}
                onAddTask={() => openNew(col.id)}
                onEditTask={openEdit}
              />
            </div>
          ))}
          {columns.length === 0 && (
            <div className="flex items-center justify-center w-full h-32 text-muted-foreground border-2 border-dashed rounded-lg">
              No columns defined. Add one above.
            </div>
          )}
        </div>
      </DragDropContext>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        onSave={(t) => handleSave({ ...t, status: editingTask ? t.status : (newStatus as any) })}
        onDelete={handleDelete}
      />
    </div>
  );
}
