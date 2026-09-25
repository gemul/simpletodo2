import React, { useState } from 'react';
import { Task, FilterView, SortOption, TaskCategory } from '../types';
import { TaskItem } from './TaskItem';
import { 
  Search, 
  X, 
  ArrowUpDown, 
  CheckCircle2, 
  Sparkles, 
  Folder, 
  Calendar,
  ChevronDown
} from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onTogglePin: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onSelectForFocus?: (task: Task) => void;
  focusedTaskId?: string | null;
  currentCategory: string;
  onSelectCategory: (category: string) => void;
  categories: string[];
  sortOption: SortOption;
  onChangeSortOption: (sort: SortOption) => void;
  currentView: FilterView;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggleTask,
  onDeleteTask,
  onTogglePin,
  onUpdateTask,
  onSelectForFocus,
  focusedTaskId,
  currentCategory,
  onSelectCategory,
  categories,
  sortOption,
  onChangeSortOption,
  currentView,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(false);

  // 1. Search filter
  const filteredBySearch = tasks.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      t.category.toLowerCase().includes(q)
    );
  });

  // 2. Category filter
  const filteredByCategory = filteredBySearch.filter((t) => {
    if (currentCategory === 'All') return true;
    return t.category.toLowerCase() === currentCategory.toLowerCase();
  });

  // 3. View Filter (today, upcoming, high-priority, completed)
  const todayStr = new Date().toISOString().slice(0, 10);
  const filteredByView = filteredByCategory.filter((t) => {
    if (currentView === 'today') {
      return t.dueDate === todayStr;
    }
    if (currentView === 'upcoming') {
      return t.dueDate && t.dueDate > todayStr && !t.completed;
    }
    if (currentView === 'high-priority') {
      return t.priority === 'high' && !t.completed;
    }
    if (currentView === 'completed') {
      return t.completed;
    }
    if (hideCompleted) {
      return !t.completed;
    }
    return true;
  });

  // 4. Sorting
  const sortedTasks = [...filteredByView].sort((a, b) => {
    // Pinned tasks always appear first unless viewing completed only
    if (currentView !== 'completed') {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
    }

    if (sortOption === 'dueDate') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    }
    if (sortOption === 'priority') {
      const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2, none: 3 };
      return (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3);
    }
    if (sortOption === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortOption === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortOption === 'alphabetical') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  const pinnedTasks = sortedTasks.filter((t) => t.pinned && !t.completed);
  const unpinnedTasks = sortedTasks.filter((t) => !t.pinned || t.completed);

  const getSortLabel = () => {
    switch (sortOption) {
      case 'dueDate':
        return 'Due Date';
      case 'priority':
        return 'Priority';
      case 'newest':
        return 'Newest';
      case 'oldest':
        return 'Oldest';
      case 'alphabetical':
        return 'Alphabetical';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search, Category Bar, and Sorting Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Tabs (Interactive Segmented Buttons) */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => onSelectCategory('All')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium cursor-pointer ${
              currentCategory === 'All'
                ? 'bg-neutral-900 text-white shadow-2xs font-semibold'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium cursor-pointer ${
                currentCategory === cat
                  ? 'bg-neutral-900 text-white shadow-2xs font-semibold'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search and Sort Row */}
        <div className="flex items-center gap-2">
          {/* Real-time Search Box */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tasks..."
              className="w-full text-xs pl-8 pr-7 py-1.5 bg-white border border-neutral-200 rounded-lg outline-none focus:border-neutral-400 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Sort Selector Dropdown */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="px-2.5 py-1.5 bg-white border border-neutral-200 hover:border-neutral-300 rounded-lg text-xs font-medium text-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
              <span className="hidden sm:inline">Sort: </span>
              <span className="font-semibold text-neutral-900">{getSortLabel()}</span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {showSortMenu && (
              <div className="absolute right-0 mt-1 z-20 w-36 bg-white border border-neutral-200 rounded-lg shadow-lg p-1 text-xs">
                {(
                  [
                    { id: 'dueDate', label: 'Due Date' },
                    { id: 'priority', label: 'Priority' },
                    { id: 'newest', label: 'Newest' },
                    { id: 'oldest', label: 'Oldest' },
                    { id: 'alphabetical', label: 'Alphabetical' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onChangeSortOption(opt.id);
                      setShowSortMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between ${
                      sortOption === opt.id
                        ? 'bg-neutral-100 font-semibold text-neutral-900'
                        : 'hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {sortOption === opt.id && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Task List */}
      {sortedTasks.length === 0 ? (
        // Polished Empty State
        <div className="bg-white border border-neutral-200 rounded-2xl p-8 sm:p-12 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3">
            <CheckCircle2 className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-900">
            {searchQuery
              ? 'No matching tasks'
              : currentView === 'completed'
              ? 'No completed tasks yet'
              : 'Everything is caught up'}
          </h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No tasks match "${searchQuery}". Try clearing the search query.`
              : currentView === 'completed'
              ? 'Completed tasks will be recorded here.'
              : 'Add a new task using the box above or press / to jump straight to typing.'}
          </p>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-4 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-medium rounded-lg transition-colors inline-block"
            >
              Clear search filter
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {/* Pinned Tasks Group */}
          {pinnedTasks.length > 0 && (
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 px-1 text-xs font-semibold text-amber-700 tracking-wide uppercase">
                <span>Pinned Tasks ({pinnedTasks.length})</span>
                <div className="flex-1 h-px bg-amber-100" />
              </div>
              {pinnedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={onToggleTask}
                  onDelete={onDeleteTask}
                  onTogglePin={onTogglePin}
                  onUpdate={onUpdateTask}
                  onSelectForFocus={onSelectForFocus}
                  isFocused={focusedTaskId === task.id}
                />
              ))}
            </div>
          )}

          {/* Standard / Remaining Tasks */}
          {unpinnedTasks.length > 0 && (
            <div className="space-y-2">
              {pinnedTasks.length > 0 && (
                <div className="flex items-center gap-2 px-1 pt-2 text-xs font-semibold text-neutral-400 tracking-wide uppercase">
                  <span>Other Tasks ({unpinnedTasks.length})</span>
                  <div className="flex-1 h-px bg-neutral-200" />
                </div>
              )}
              {unpinnedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={onToggleTask}
                  onDelete={onDeleteTask}
                  onTogglePin={onTogglePin}
                  onUpdate={onUpdateTask}
                  onSelectForFocus={onSelectForFocus}
                  isFocused={focusedTaskId === task.id}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
