import React, { useState, useEffect } from 'react';
import { Task, FilterView, SortOption, TaskCategory, Priority } from './types';
import { 
  loadTasksFromStorage, 
  saveTasksToStorage, 
  loadSoundSetting, 
  saveSoundSetting,
  getDefaultTasks,
  getTodayDateString 
} from './utils/storage';
import { playCompleteSound, playTickSound } from './utils/audio';
import { Header } from './components/Header';
import { TaskInput } from './components/TaskInput';
import { TaskStats } from './components/TaskStats';
import { TaskList } from './components/TaskList';
import { FocusTimer } from './components/FocusTimer';
import { ShortcutsModal } from './components/ShortcutsModal';
import { ImportExportModal } from './components/ImportExportModal';
import { Undo2, X, Plus } from 'lucide-react';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasksFromStorage());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => loadSoundSetting());
  const [currentView, setCurrentView] = useState<FilterView>('all');
  const [currentCategory, setCurrentCategory] = useState<string>('All');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  
  // Modals & Panels
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Undo Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [recentlyDeletedTask, setRecentlyDeletedTask] = useState<Task | null>(null);
  const [toastTimer, setToastTimer] = useState<NodeJS.Timeout | null>(null);

  // Save tasks on state update
  useEffect(() => {
    saveTasksToStorage(tasks);
  }, [tasks]);

  // Save sound setting
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    saveSoundSetting(next);
  };

  // Keyboard shortcut for '?' to open shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '')) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsShortcutsOpen(false);
        setIsExportOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute Categories dynamically from tasks + standards
  const standardCategories = ['Work', 'Personal', 'Projects', 'Errands'];
  const customCategories = Array.from(
    new Set(tasks.map((t) => t.category).filter((c) => !standardCategories.includes(c)))
  );
  const allCategories = [...standardCategories, ...customCategories];

  // Task operations
  const handleAddTask = (newTaskData: {
    title: string;
    description?: string;
    priority: Priority;
    category: TaskCategory;
    dueDate?: string;
  }) => {
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: newTaskData.title,
      description: newTaskData.description,
      completed: false,
      priority: newTaskData.priority,
      category: newTaskData.category,
      dueDate: newTaskData.dueDate,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
    if (soundEnabled) playTickSound();
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          if (nextCompleted && soundEnabled) {
            playCompleteSound();
          } else if (soundEnabled) {
            playTickSound();
          }
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (id: string) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    if (!taskToDelete) return;

    if (soundEnabled) playTickSound();
    setRecentlyDeletedTask(taskToDelete);
    setTasks((prev) => prev.filter((t) => t.id !== id));

    if (focusedTaskId === id) {
      setFocusedTaskId(null);
    }

    // Trigger Undo Toast
    if (toastTimer) clearTimeout(toastTimer);
    setToastMessage(`Deleted "${taskToDelete.title}"`);
    const timer = setTimeout(() => {
      setToastMessage(null);
      setRecentlyDeletedTask(null);
    }, 5000);
    setToastTimer(timer);
  };

  const handleUndoDelete = () => {
    if (recentlyDeletedTask) {
      setTasks((prev) => [recentlyDeletedTask, ...prev]);
      setRecentlyDeletedTask(null);
      setToastMessage(null);
      if (soundEnabled) playTickSound();
    }
  };

  const handleTogglePin = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, pinned: !t.pinned } : t))
    );
    if (soundEnabled) playTickSound();
  };

  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const handleClearCompleted = () => {
    const count = tasks.filter((t) => t.completed).length;
    if (count === 0) return;
    setTasks((prev) => prev.filter((t) => !t.completed));
    if (soundEnabled) playTickSound();
  };

  const handleCompleteAll = () => {
    setTasks((prev) =>
      prev.map((t) => ({
        ...t,
        completed: true,
        completedAt: t.completedAt || new Date().toISOString(),
      }))
    );
    if (soundEnabled) playCompleteSound();
  };

  const handleResetTasks = () => {
    const defaults = getDefaultTasks();
    setTasks(defaults);
    saveTasksToStorage(defaults);
    if (soundEnabled) playTickSound();
  };

  const handleImportTasks = (importedTasks: Task[]) => {
    setTasks(importedTasks);
    saveTasksToStorage(importedTasks);
    if (soundEnabled) playCompleteSound();
  };

  // Metrics counts
  const todayStr = getTodayDateString();
  const counts = {
    all: tasks.length,
    today: tasks.filter((t) => t.dueDate === todayStr).length,
    upcoming: tasks.filter((t) => t.dueDate && t.dueDate > todayStr && !t.completed).length,
    highPriority: tasks.filter((t) => t.priority === 'high' && !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
  };

  const pendingCount = tasks.filter((t) => !t.completed).length;

  const activeFocusTask = tasks.find((t) => t.id === focusedTaskId) || 
    tasks.find((t) => !t.completed) || 
    null;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col text-neutral-900 selection:bg-neutral-900 selection:text-white">
      {/* Universal Top Bar Contract */}
      <Header
        currentView={currentView}
        onSelectView={(v) => {
          setCurrentView(v);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        counts={counts}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        isFocusMode={isFocusMode}
        onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Optional Focus Timer Bar */}
        {isFocusMode && (
          <FocusTimer
            activeTask={activeFocusTask}
            onClose={() => setIsFocusMode(false)}
            onCompleteTask={handleToggleTask}
            soundEnabled={soundEnabled}
          />
        )}

        {/* View Heading & Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pb-1">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              {currentView === 'all' && 'All Tasks'}
              {currentView === 'today' && 'Today’s Focus'}
              {currentView === 'upcoming' && 'Upcoming Tasks'}
              {currentView === 'high-priority' && 'High Priority Tasks'}
              {currentView === 'completed' && 'Completed Archive'}
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              {currentView === 'all' && 'Organize your day, track priorities, and stay on course.'}
              {currentView === 'today' && `Scheduled for completion today, ${new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}.`}
              {currentView === 'upcoming' && 'Scheduled for upcoming days and deadlines.'}
              {currentView === 'high-priority' && 'Urgent and critical items demanding immediate attention.'}
              {currentView === 'completed' && 'Your history of accomplished objectives.'}
            </p>
          </div>

          <div className="text-xs text-neutral-500 tabular-nums">
            <span className="font-semibold text-neutral-900">{pendingCount}</span> remaining
          </div>
        </div>

        {/* Task Creation Input */}
        <TaskInput
          onAddTask={handleAddTask}
          categories={allCategories}
        />

        {/* Quick Stats & Progress */}
        <TaskStats
          total={tasks.length}
          completed={counts.completed}
          pending={pendingCount}
          highPriority={counts.highPriority}
          onClearCompleted={handleClearCompleted}
          onCompleteAll={handleCompleteAll}
        />

        {/* Task List with Search, Categories, and Sorting */}
        <TaskList
          tasks={tasks}
          onToggleTask={handleToggleTask}
          onDeleteTask={handleDeleteTask}
          onTogglePin={handleTogglePin}
          onUpdateTask={handleUpdateTask}
          onSelectForFocus={(task) => {
            setFocusedTaskId(task.id);
            setIsFocusMode(true);
          }}
          focusedTaskId={focusedTaskId}
          currentCategory={currentCategory}
          onSelectCategory={setCurrentCategory}
          categories={allCategories}
          sortOption={sortOption}
          onChangeSortOption={setSortOption}
          currentView={currentView}
        />
      </main>

      {/* Clean, Restrained Footer */}
      <footer className="mt-auto border-t border-neutral-200/80 bg-neutral-50 py-6 text-xs text-neutral-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-800">TaskFlow</span>
            <span aria-hidden="true">·</span>
            <span>Minimalist Task & Focus Companion</span>
          </div>

          <div className="flex items-center gap-4 text-neutral-500">
            <button
              type="button"
              onClick={() => setIsShortcutsOpen(true)}
              className="hover:text-neutral-900 transition-colors"
            >
              Shortcuts (?)
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setIsExportOpen(true)}
              className="hover:text-neutral-900 transition-colors"
            >
              Export / Import
            </button>
            <span aria-hidden="true">·</span>
            <span>Stored Locally</span>
          </div>
        </div>
      </footer>

      {/* Undo Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-neutral-900 text-white text-xs px-4 py-3 rounded-xl shadow-lg border border-neutral-800 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="truncate max-w-xs">{toastMessage}</span>
          {recentlyDeletedTask && (
            <button
              type="button"
              onClick={handleUndoDelete}
              className="px-2.5 py-1 bg-white text-neutral-900 font-semibold rounded-md hover:bg-neutral-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Undo2 className="w-3 h-3" />
              <span>Undo</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-neutral-400 hover:text-white p-0.5 ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Export / Import Modal */}
      <ImportExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        tasks={tasks}
        onImportTasks={handleImportTasks}
        onResetTasks={handleResetTasks}
      />
    </div>
  );
}
