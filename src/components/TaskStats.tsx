import React from 'react';
import { CheckCircle2, ListFilter, Trash2, CheckCheck } from 'lucide-react';

interface TaskStatsProps {
  total: number;
  completed: number;
  pending: number;
  highPriority: number;
  onClearCompleted: () => void;
  onCompleteAll: () => void;
}

export const TaskStats: React.FC<TaskStatsProps> = ({
  total,
  completed,
  pending,
  highPriority,
  onClearCompleted,
  onCompleteAll,
}) => {
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-3 sm:p-4 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Metric figures with tabular numerals */}
        <div className="flex items-center gap-4 sm:gap-6 text-xs text-neutral-600">
          <div>
            <span className="text-neutral-400">Total: </span>
            <span className="font-semibold text-neutral-900 tabular-nums font-mono text-sm">
              {total}
            </span>
          </div>

          <div>
            <span className="text-neutral-400">Pending: </span>
            <span className="font-semibold text-neutral-900 tabular-nums font-mono text-sm">
              {pending}
            </span>
          </div>

          <div>
            <span className="text-neutral-400">Completed: </span>
            <span className="font-semibold text-neutral-900 tabular-nums font-mono text-sm">
              {completed}
            </span>
          </div>

          {highPriority > 0 && (
            <div>
              <span className="text-red-600 font-medium">Urgent: </span>
              <span className="font-semibold text-red-700 tabular-nums font-mono text-sm">
                {highPriority}
              </span>
            </div>
          )}

          <div>
            <span className="text-neutral-400">Progress: </span>
            <span className="font-semibold text-neutral-900 tabular-nums font-mono text-sm">
              {completionPercentage}%
            </span>
          </div>
        </div>

        {/* Batch action buttons */}
        <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100 text-xs">
          {pending > 0 && (
            <button
              type="button"
              onClick={onCompleteAll}
              className="text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5 text-neutral-500" />
              <span>Complete all</span>
            </button>
          )}

          {completed > 0 && (
            <button
              type="button"
              onClick={onClearCompleted}
              className="text-neutral-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-neutral-400 hover:text-red-600" />
              <span>Clear completed</span>
            </button>
          )}
        </div>
      </div>

      {/* Subtle Progress Bar */}
      <div className="w-full bg-neutral-100 h-1.5 rounded-full mt-3 overflow-hidden">
        <div
          className="bg-neutral-900 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
    </div>
  );
};
