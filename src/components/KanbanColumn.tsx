import { Plus } from "lucide-react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { TaskCard, Task } from "./TaskCard";

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onAddTask: (status: string) => void;
  onEditTask: (task: Task) => void;
}

export function KanbanColumn({ id, title, tasks, onAddTask, onEditTask }: KanbanColumnProps) {
  return (
    <div className="flex-1 min-w-[320px] max-w-[420px]">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">{title}</h2>
          <span className="text-xs font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(id)}
          className="w-7 h-7 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all text-muted-foreground"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`space-y-3 min-h-[200px] p-2 rounded-xl transition-colors ${snapshot.isDraggingOver ? "bg-accent/50" : ""
              }`}
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    <TaskCard
                      task={task}
                      onEdit={onEditTask}
                      dragHandleProps={provided.dragHandleProps}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
