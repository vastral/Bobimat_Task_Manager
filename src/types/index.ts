export type Role = 'Administrador' | 'Operario';

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  created_at: string;
};

export type TaskStatus = 'Taller' | 'Presupuesto' | 'Pendiente de repuesto' | 'Hecho';

export type Task = {
  id: string;
  reference: string;
  status: TaskStatus;
  previous_status: TaskStatus | null;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
};

export type LogEntry = {
  id: string;
  task_reference: string;
  previous_status: TaskStatus | null;
  new_status: TaskStatus;
  user_email: string;
  user_name: string;
  timestamp: string;
};
