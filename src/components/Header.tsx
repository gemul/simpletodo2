import React from 'react';
import { FilterView } from '../types';
import { 
  CheckSquare2, 
  Calendar, 
  Clock, 
  Flame, 
  Volume2, 
  VolumeX, 
  Download, 
  HelpCircle,
  Timer
} from 'lucide-react';

interface HeaderProps {
  currentView: FilterView;
  onSelectView: (view: FilterView) => void;
  counts: {
    all: number;
    today: number;
    upcoming: number;
    highPriority: number;
    completed: number;
  };
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenExport: () => void;
  onOpenShortcuts: () => void;
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSelectView,
  counts,
  soundEnabled,
  onToggleSound,
  onOpenExport,
  onOpenShortcuts,
  isFocusMode,
  onToggleFocusMode,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-neutral-50/90 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text wordmark with small subtle icon */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            TF
          </div>
          <span className="text-lg font-bold tracking-tight text-neutral-900">
            Gema's Todo list
          </span>
        </div>

        {/* Zone 2: Navigation Links (Clean text with subtle active state, single-line controls) */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => onSelectView('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentView === 'all'
                ? 'bg-neutral-200/80 text-neutral-900 font-semibold shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <CheckSquare2 className="w-4 h-4 text-neutral-500" />
            <span>All Tasks</span>
            <span className="text-xs tabular-nums text-neutral-400 ml-0.5">
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectView('today')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentView === 'today'
                ? 'bg-neutral-200/80 text-neutral-900 font-semibold shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <Calendar className="w-4 h-4 text-neutral-500" />
            <span>Today</span>
            <span className="text-xs tabular-nums text-neutral-400 ml-0.5">
              {counts.today}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectView('upcoming')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentView === 'upcoming'
                ? 'bg-neutral-200/80 text-neutral-900 font-semibold shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <Clock className="w-4 h-4 text-neutral-500" />
            <span>Upcoming</span>
            <span className="text-xs tabular-nums text-neutral-400 ml-0.5">
              {counts.upcoming}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectView('high-priority')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentView === 'high-priority'
                ? 'bg-neutral-200/80 text-neutral-900 font-semibold shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-600" />
            <span>Priority</span>
            <span className="text-xs tabular-nums text-neutral-400 ml-0.5">
              {counts.highPriority}
            </span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Focus Mode button */}
          <button
            type="button"
            onClick={onToggleFocusMode}
            title={isFocusMode ? "Exit Focus Mode" : "Start Focus Timer (Pomodoro)"}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              isFocusMode
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
            }`}
          >
            <Timer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isFocusMode ? 'Focus Active' : 'Focus Timer'}</span>
          </button>

          {/* Sound toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute acoustic clicks' : 'Enable acoustic clicks'}
            className="p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
            aria-label="Toggle sound feedback"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4 text-neutral-400" />
            )}
          </button>

          {/* Export / Backup */}
          <button
            type="button"
            onClick={onOpenExport}
            title="Export / Backup Tasks"
            className="p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
            aria-label="Export or import data"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Shortcuts Info */}
          <button
            type="button"
            onClick={onOpenShortcuts}
            title="Keyboard Shortcuts"
            className="p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
            aria-label="Keyboard shortcuts"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
