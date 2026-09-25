import React, { useState } from 'react';
import { Task, Priority } from '../types';
import { getTodayDateString } from '../utils/storage';
import { 
  Check, 
  Trash2, 
  Edit3, 
  Pin, 
  Calendar, 
  AlertCircle, 
  CornerDownRight,
  Save,
  X
} from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onSelectForFocus?: (task: Task) => void;
  isFocused?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onDelete,
  onTogglePin,
  onUpdate,
  onSelectForFocus,
  isFocused,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description || '');
  const [editPriority, setEditPriority] = useState<Priority>(task.priority);
  const [editDueDate, setEditDueDate] = useState(task.dueDate || '');

  const todayStr = getTodayDateString();

  const handleSaveEdit = () => {
    if (!editTitle.trim()) return;
    onUpdate(task.id, {
      title: editTitle.trim(),
      description: editDesc.trim() || undefined,
      priority: editPriority,
      dueDate: editDueDate || undefined,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setEditPriority(task.priority);
    setEditDueDate(task.dueDate || '');
    setIsEditing(false);
  };

  // Due date status formatting
  const getDueStatus = () => {
    if (!task.dueDate) return null;
    if (task.completed) {
      return { label: task.dueDate, isOverdue: false, isToday: false };
    }
    if (task.dueDate < todayStr) {
      return { label: `Overdue (${task.dueDate})`, isOverdue: true, isToday: false };
    }
    if (task.dueDate === todayStr) {
      return { label: 'Due Today', isOverdue: false, isToday: true };
    }
    return { label: task.dueDate, isOverdue: false, isToday: false };
  };

  const dueStatus = getDueStatus();

  return (
    <div
      className={`group relative bg-white border rounded-xl transition-all ${
        task.pinned ? 'border-neutral-300 shadow-2xs' : 'border-neutral-200'
      } ${
        isFocused ? 'ring-2 ring-neutral-900 border-neutral-900' : ''
      } hover:border-neutral-300 p-3 sm:p-4`}
    >
      {isEditing ? (
        // Inline Edit Mode
        <div className="space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full text-sm font-medium text-neutral-900 border border-neutral-300 rounded-lg p-2 outline-none focus:border-neutral-600"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSaveEdit();
              }
              if (e.key === 'Escape') {
                handleCancelEdit();
              }
            }}
          />

          <textarea
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            placeholder="Description or notes..."
            rows={2}
            className="w-full text-xs text-neutral-700 border border-neutral-200 rounded-lg p-2 outline-none focus:border-neutral-400 resize-none"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2 text-xs">
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as Priority)}
                className="p-1 border border-neutral-200 rounded text-xs bg-white text-neutral-800"
              >
                <option value="none">No Priority</option>
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>

              <input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="p-1 border border-neutral-200 rounded text-xs bg-white text-neutral-800"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-2.5 py-1 text-xs text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-3 py-1 text-xs bg-neutral-900 text-white font-medium hover:bg-neutral-800 rounded-md transition-colors flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Standard View Mode
        <div className="flex items-start gap-3">
          {/* Custom Checkbox */}
          <button
            type="button"
            onClick={() => onToggle(task.id)}
            className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
              task.completed
                ? 'bg-neutral-900 border-neutral-900 text-white shadow-2xs'
                : 'border-neutral-300 bg-white hover:border-neutral-500 hover:bg-neutral-50'
            }`}
            aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
          >
            {task.completed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
          </button>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div 
                className="cursor-pointer"
                onDoubleClick={() => setIsEditing(true)}
              >
                <p
                  className={`text-sm font-medium leading-snug transition-colors ${
                    task.completed
                      ? 'text-neutral-400 line-through decoration-neutral-300'
                      : 'text-neutral-900'
                  }`}
                >
                  {task.title}
                </p>

                {task.description && (
                  <p
                    className={`mt-1 text-xs leading-relaxed transition-colors line-clamp-2 ${
                      task.completed ? 'text-neutral-400' : 'text-neutral-600'
                    }`}
                  >
                    {task.description}
                  </p>
                )}
              </div>

              {/* Action Buttons (Right Aligned, Visible on Hover/Mobile) */}
              <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                {onSelectForFocus && !task.completed && (
                  <button
                    type="button"
                    onClick={() => onSelectForFocus(task)}
                    title={isFocused ? "Current focus task" : "Focus on this task with timer"}
                    className={`p-1.5 rounded-md transition-colors ${
                      isFocused
                        ? 'text-neutral-900 bg-neutral-100 font-semibold'
                        : 'text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100'
                    }`}
                  >
                    <CornerDownRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onTogglePin(task.id)}
                  title={task.pinned ? "Unpin task" : "Pin task to top"}
                  className={`p-1.5 rounded-md transition-colors ${
                    task.pinned
                      ? 'text-amber-700 bg-amber-50'
                      : 'text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100'
                  }`}
                >
                  <Pin className={`w-3.5 h-3.5 ${task.pinned ? 'fill-amber-600' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  title="Edit task"
                  className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(task.id)}
                  title="Delete task"
                  className="p-1.5 rounded-md text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Zero-Pill Static Metadata Strip */}
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-neutral-500">
              {/* Category */}
              <span className="font-medium text-neutral-700">{task.category}</span>

              {/* Priority - Quiet unboxed text indicator */}
              {task.priority !== 'none' && (
                <>
                  <span aria-hidden="true" className="text-neutral-300">·</span>
                  <span
                    className={`font-medium ${
                      task.priority === 'high'
                        ? 'text-red-700'
                        : task.priority === 'medium'
                        ? 'text-amber-700'
                        : 'text-blue-700'
                    }`}
                  >
                    {task.priority === 'high'
                      ? 'P1 Urgent'
                      : task.priority === 'medium'
                      ? 'P2 Medium'
                      : 'P3 Low'}
                  </span>
                </>
              )}

              {/* Due Date - Quiet unboxed text indicator */}
              {dueStatus && (
                <>
                  <span aria-hidden="true" className="text-neutral-300">·</span>
                  <span
                    className={`inline-flex items-center gap-1 tabular-nums ${
                      dueStatus.isOverdue
                        ? 'text-red-700 font-semibold'
                        : dueStatus.isToday
                        ? 'text-amber-700 font-medium'
                        : 'text-neutral-500'
                    }`}
                  >
                    {dueStatus.isOverdue && (
                      <AlertCircle className="w-3 h-3 text-red-600 inline" />
                    )}
                    {!dueStatus.isOverdue && (
                      <Calendar className="w-3 h-3 text-neutral-400 inline" />
                    )}
                    <span>{dueStatus.label}</span>
                  </span>
                </>
              )}

              {/* Completed Timestamp */}
              {task.completed && task.completedAt && (
                <>
                  <span aria-hidden="true" className="text-neutral-300">·</span>
                  <span className="text-neutral-400">
                    Done {new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </>
              )}

              {/* Pinned Marker */}
              {task.pinned && (
                <>
                  <span aria-hidden="true" className="text-neutral-300">·</span>
                  <span className="text-amber-700 font-medium">Pinned</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
