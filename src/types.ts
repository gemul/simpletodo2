export type Priority = 'high' | 'medium' | 'low' | 'none';

export type TaskCategory = 'Work' | 'Personal' | 'Projects' | 'Errands' | string;

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
  priority: Priority;
  category: TaskCategory;
  dueDate?: string; // YYYY-MM-DD
  createdAt: string;
  pinned?: boolean;
}

export type FilterView = 'all' | 'today' | 'upcoming' | 'high-priority' | 'completed';

export type SortOption = 'dueDate' | 'priority' | 'newest' | 'oldest' | 'alphabetical';
