export interface Todo {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  due_time?: string;
  category: "personal" | "work" | "shopping";
  completed: boolean;
  created_at: string;
  user_id: string;
}

export interface FormData {
  title: string;
  description: string;
  due_date: Date;
  due_time: Date;
  category: "personal" | "work" | "shopping";
}
