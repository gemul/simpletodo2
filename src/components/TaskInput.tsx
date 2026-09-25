import React, { useState, useRef, useEffect } from 'react';
import { Priority, TaskCategory } from '../types';
import { getTodayDateString, getTomorrowDateString } from '../utils/storage';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Flag, 
  Folder, 
  AlignLeft, 
  ChevronDown,
  X
} from 'lucide-react';

interface TaskInputProps {
  onAddTask: (task: {
    title: string;
    description?: string;
    priority: Priority;
    category: TaskCategory;
    dueDate?: string;
  }) => void;
  categories: string[];
}

export const TaskInput: React.FC<TaskInputProps> = ({ onAddTask, categories }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [priority, setPriority] = useState<Priority>('none');
  const [category, setCategory] = useState<TaskCategory>('Work');
  const [dueDate, setDueDate] = useState<string>(getTodayDateString());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Global shortcut '/' to focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    onAddTask({
      title: cleanTitle,
      description: description.trim() || undefined,
      priority,
      category,
      dueDate: dueDate || undefined,
    });

    setTitle('');
    setDescription('');
    setShowNotes(false);
    // Keep category and priority or reset as convenient
  };

  const todayStr = getTodayDateString();
  const tomorrowStr = getTomorrowDateString();

  const getDueDateLabel = () => {
    if (!dueDate) return 'No Date';
    if (dueDate === todayStr) return 'Today';
    if (dueDate === tomorrowStr) return 'Tomorrow';
    return dueDate;
  };

  const getPriorityLabel = () => {
    switch (priority) {
      case 'high':
        return 'High Priority';
      case 'medium':
        return 'Medium Priority';
      case 'low':
        return 'Low Priority';
      default:
        return 'Priority';
    }
  };

  const getPriorityColor = () => {
    switch (priority) {
      case 'high':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'medium':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'low':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-neutral-600 bg-white border-neutral-200';
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-3 sm:p-4 shadow-xs transition-shadow focus-within:border-neutral-400 focus-within:shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Main Title Row */}
        <div className="flex items-center gap-3">
          <div className="text-neutral-400 pl-1">
            <Plus className="w-5 h-5" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a new task... (press '/' to focus, Enter to save)"
            className="w-full text-base font-medium text-neutral-900 placeholder:text-neutral-400 bg-transparent border-0 outline-none focus:ring-0"
          />
          {title.trim().length > 0 && (
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg transition-colors shrink-0 shadow-2xs cursor-pointer"
            >
              Add Task
            </button>
          )}
        </div>

        {/* Optional Description / Sub-notes */}
        {showNotes && (
          <div className="pl-9 pr-2">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add optional notes, links, or context..."
              rows={2}
              className="w-full text-sm text-neutral-700 placeholder:text-neutral-400 bg-neutral-50/70 border border-neutral-200 rounded-lg p-2.5 outline-none focus:border-neutral-400 transition-colors resize-none"
            />
          </div>
        )}

        {/* Meta Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {/* Due Date Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <CalendarIcon className="w-3.5 h-3.5 text-neutral-500" />
                <span>{getDueDateLabel()}</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {showDatePicker && (
                <div className="absolute left-0 mt-1 z-20 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg p-2 text-xs">
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setDueDate(todayStr);
                        setShowDatePicker(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded hover:bg-neutral-100 flex items-center justify-between"
                    >
                      <span>Today</span>
                      <span className="text-neutral-400 tabular-nums">
                        {todayStr.slice(5)}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDueDate(tomorrowStr);
                        setShowDatePicker(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded hover:bg-neutral-100 flex items-center justify-between"
                    >
                      <span>Tomorrow</span>
                      <span className="text-neutral-400 tabular-nums">
                        {tomorrowStr.slice(5)}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDueDate('');
                        setShowDatePicker(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded hover:bg-neutral-100 text-neutral-500"
                    >
                      No due date
                    </button>
                    <div className="pt-1 border-t border-neutral-100">
                      <label className="block text-[11px] text-neutral-500 mb-1 px-1">
                        Custom date:
                      </label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => {
                          setDueDate(e.target.value);
                          setShowDatePicker(false);
                        }}
                        className="w-full p-1 border border-neutral-200 rounded text-xs bg-neutral-50"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Priority Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPriorityMenu(!showPriorityMenu)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs transition-colors cursor-pointer ${getPriorityColor()}`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{getPriorityLabel()}</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {showPriorityMenu && (
                <div className="absolute left-0 mt-1 z-20 w-36 bg-white border border-neutral-200 rounded-lg shadow-lg p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setPriority('high');
                      setShowPriorityMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-red-50 text-red-700 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-red-600" />
                    <span>High Priority</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPriority('medium');
                      setShowPriorityMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-amber-50 text-amber-700 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-600" />
                    <span>Medium Priority</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPriority('low');
                      setShowPriorityMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-blue-50 text-blue-700 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <span>Low Priority</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPriority('none');
                      setShowPriorityMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-neutral-100 text-neutral-600 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-neutral-300" />
                    <span>No Priority</span>
                  </button>
                </div>
              )}
            </div>

            {/* Category / List Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <Folder className="w-3.5 h-3.5 text-neutral-500" />
                <span>{category}</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {showCategoryMenu && (
                <div className="absolute left-0 mt-1 z-20 w-44 bg-white border border-neutral-200 rounded-lg shadow-lg p-1.5 text-xs">
                  <div className="space-y-0.5">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setCategory(cat);
                          setShowCategoryMenu(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between ${
                          category === cat
                            ? 'bg-neutral-100 font-semibold text-neutral-900'
                            : 'hover:bg-neutral-50 text-neutral-700'
                        }`}
                      >
                        <span>{cat}</span>
                        {category === cat && (
                          <span className="text-neutral-500">✓</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {isAddingCustomCategory ? (
                    <div className="mt-2 pt-2 border-t border-neutral-100">
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={customCategoryInput}
                          onChange={(e) => setCustomCategoryInput(e.target.value)}
                          placeholder="Category name..."
                          className="w-full p-1 border border-neutral-200 rounded text-xs"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (customCategoryInput.trim()) {
                                setCategory(customCategoryInput.trim());
                                setIsAddingCustomCategory(false);
                                setCustomCategoryInput('');
                                setShowCategoryMenu(false);
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (customCategoryInput.trim()) {
                              setCategory(customCategoryInput.trim());
                              setIsAddingCustomCategory(false);
                              setCustomCategoryInput('');
                              setShowCategoryMenu(false);
                            }
                          }}
                          className="px-2 py-1 bg-neutral-900 text-white rounded text-xs"
                        >
                          OK
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAddingCustomCategory(true)}
                      className="mt-1 pt-1 border-t border-neutral-100 w-full text-left px-2.5 py-1 text-neutral-500 hover:text-neutral-900"
                    >
                      + New category
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Toggle Notes Button */}
            <button
              type="button"
              onClick={() => setShowNotes(!showNotes)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs transition-colors cursor-pointer ${
                showNotes || description
                  ? 'border-neutral-300 bg-neutral-100 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span>{showNotes ? 'Hide notes' : 'Notes'}</span>
            </button>
          </div>

          <div className="text-[11px] text-neutral-400 font-mono hidden sm:block">
            Press <kbd className="px-1 py-0.5 bg-neutral-100 border border-neutral-200 rounded text-[10px]">Enter</kbd> to save
          </div>
        </div>
      </form>
    </div>
  );
};
