import { Task } from '../types';

const STORAGE_KEY = 'taskflow_todos_v1';
const SOUND_KEY = 'taskflow_sound_enabled';

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTomorrowDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDefaultTasks(): Task[] {
  const today = getTodayDateString();
  const tomorrow = getTomorrowDateString();

  return [
    {
      id: 'task-1',
      title: 'Finalize quarterly project proposal and milestones',
      description: 'Review budget estimates and align with engineering team before EOD.',
      completed: false,
      priority: 'high',
      category: 'Work',
      dueDate: today,
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      pinned: true,
    },
    {
      id: 'task-2',
      title: 'Review pull request #142 for caching layer optimization',
      description: 'Check benchmark figures and ensure backward compatibility tests pass.',
      completed: false,
      priority: 'medium',
      category: 'Projects',
      dueDate: today,
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
    {
      id: 'task-3',
      title: 'Schedule bi-annual dental checkup and cleaning',
      completed: false,
      priority: 'low',
      category: 'Personal',
      dueDate: tomorrow,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'task-4',
      title: 'Grocery restock: oat milk, sourdough bread, organic greens',
      completed: false,
      priority: 'none',
      category: 'Errands',
      dueDate: today,
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    },
    {
      id: 'task-5',
      title: 'Morning workout: 30 minutes cardio and stretching',
      completed: true,
      completedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      priority: 'medium',
      category: 'Personal',
      dueDate: today,
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    },
  ];
}

export function loadTasksFromStorage(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getDefaultTasks();
      saveTasksToStorage(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return getDefaultTasks();
  } catch (err) {
    console.error('Failed to read tasks from localStorage', err);
    return getDefaultTasks();
  }
}

export function saveTasksToStorage(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks to localStorage', err);
  }
}

export function loadSoundSetting(): boolean {
  try {
    const val = localStorage.getItem(SOUND_KEY);
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

export function saveSoundSetting(enabled: boolean): void {
  try {
    localStorage.setItem(SOUND_KEY, String(enabled));
  } catch (err) {
    console.error('Failed to save sound setting', err);
  }
}
