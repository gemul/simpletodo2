import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { Play, Pause, RotateCcw, Check, X, Bell } from 'lucide-react';
import { playCompleteSound, playTickSound } from '../utils/audio';

interface FocusTimerProps {
  activeTask?: Task | null;
  onClose: () => void;
  onCompleteTask: (id: string) => void;
  soundEnabled: boolean;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({
  activeTask,
  onClose,
  onCompleteTask,
  soundEnabled,
}) => {
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 min default
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (soundEnabled) {
        playCompleteSound();
      }
      setIsRunning(false);
      // Switch mode
      if (mode === 'work') {
        setMode('break');
        setTimeLeft(5 * 60);
      } else {
        setMode('work');
        setTimeLeft(25 * 60);
      }
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, mode, soundEnabled]);

  const handleTogglePlay = () => {
    if (soundEnabled) playTickSound();
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    if (soundEnabled) playTickSound();
    setIsRunning(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const handleModeChange = (newMode: 'work' | 'break') => {
    if (soundEnabled) playTickSound();
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(newMode === 'work' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="bg-neutral-900 text-white rounded-2xl p-4 sm:p-6 mb-6 shadow-md border border-neutral-800">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Focus Session
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Mode Switcher */}
          <div className="flex items-center bg-neutral-800 rounded-lg p-0.5 text-xs">
            <button
              type="button"
              onClick={() => handleModeChange('work')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                mode === 'work'
                  ? 'bg-neutral-700 text-white font-medium'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              25m Focus
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('break')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                mode === 'break'
                  ? 'bg-neutral-700 text-white font-medium'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              5m Break
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors ml-2"
            title="Close Focus Mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-6">
        <div className="text-center sm:text-left">
          <div className="text-5xl sm:text-6xl font-mono font-bold tracking-tight tabular-nums text-white">
            {formatTime(timeLeft)}
          </div>
          <div className="text-xs text-neutral-400 mt-2">
            {mode === 'work' ? 'Stay engaged on the current task' : 'Take a breath and stretch'}
          </div>
        </div>

        {/* Current Target Task */}
        <div className="flex-1 max-w-md bg-neutral-800/80 border border-neutral-700/60 rounded-xl p-3.5">
          <div className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold mb-1">
            Current Target
          </div>
          {activeTask ? (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {activeTask.title}
                </p>
                <p className="text-xs text-neutral-400 truncate">
                  {activeTask.category} {activeTask.dueDate ? `· Due ${activeTask.dueDate}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onCompleteTask(activeTask.id);
                  if (soundEnabled) playCompleteSound();
                }}
                className="shrink-0 px-2.5 py-1 bg-white hover:bg-neutral-200 text-neutral-900 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Mark this task done"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Done</span>
              </button>
            </div>
          ) : (
            <p className="text-xs text-neutral-400 italic">
              Select any task from your list below to focus on it.
            </p>
          )}
        </div>

        {/* Timer Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleTogglePlay}
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-semibold transition-transform active:scale-95 shadow-sm ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-neutral-900'
                : 'bg-white hover:bg-neutral-100 text-neutral-900'
            }`}
          >
            {isRunning ? (
              <Pause className="w-5 h-5 fill-neutral-900" />
            ) : (
              <Play className="w-5 h-5 fill-neutral-900 ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="w-10 h-10 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
