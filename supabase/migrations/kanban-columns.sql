-- 1. Create the kanban_columns table
CREATE TABLE IF NOT EXISTS public.kanban_columns (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.kanban_columns ENABLE ROW LEVEL SECURITY;

-- 3. Create policies (allow everyone to read, authenticated to edit)
-- Adjust these based on your actual auth requirements. 
-- Assuming shared board for now or user-specific if we add user_id.
-- For this simplified version, we'll allow authenticated users to do everything.

CREATE POLICY "Authenticated users can select columns" ON public.kanban_columns
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert columns" ON public.kanban_columns
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update columns" ON public.kanban_columns
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete columns" ON public.kanban_columns
    FOR DELETE USING (auth.role() = 'authenticated');


-- 4. Seed default columns
INSERT INTO public.kanban_columns (id, title, "order")
VALUES 
    ('todo', 'To Do', 0),
    ('in-progress', 'In Progress', 1),
    ('done', 'Done', 2)
ON CONFLICT (id) DO NOTHING;

-- 5. Remove the strict CHECK constraint on tasks.status
-- We need to find the name of the constraint first. 
-- Usually it's tasks_status_check, but if it was auto-generated verify it.
-- We will accept any text for status now, effectively making it dynamic.

ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_status_check;

-- Optional: If you want to enforce referential integrity
-- ALTER TABLE public.tasks ADD CONSTRAINT fk_tasks_status 
-- FOREIGN KEY (status) REFERENCES public.kanban_columns(id);
