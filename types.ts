
export enum TaskStatus {
  TODO = 1,
  DOING = 2,
  DONE = 3
}

export type PriorityValue = 1 | 2 | 3 | 4 | 5;

export type UserRole = "user" | "admin";

export interface User {
  user_id: number;
  username: string;
  role: UserRole;
}

export interface TaskResponse {
  task_id: number;
  name: string;
  category_id: number;
  user_id: number;
  description: string | null;
  due_date: string;
  status: TaskStatus;
  priority: PriorityValue;
  created_at: string;
  updated_at: string;
}

export interface CategoryResponse {
  category_id: number;
  name: string;
  color: string;
  icon: string;
}

export interface SubTaskResponse {
  sub_task_id: number;
  name: string;
  description: string | null;
  task_id: number;
}

export interface AttachmentResponse {
  attechment_id: number;
  file_path: string;
  task_id: number;
}

export interface ProfileResponse {
  user: User;
  result: {
    task_count: number;
    task_todo: number;
    task_doing: number;
    task_done: number;
  };
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}
