import React from 'react';
import { X, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '/', desc: 'Focus the task input box from anywhere' },
    { key: 'Enter', desc: 'Save task when typing in input or editor' },
    { key: 'Escape', desc: 'Cancel editing or close modals' },
    { key: 'Double Click', desc: 'Inline edit any task title' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white border border-neutral-200 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Command className="w-4 h-4 text-neutral-600" />
            <h2 className="text-sm font-bold text-neutral-900">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {shortcuts.map((s) => (
            <div
              key={s.key}
              className="flex items-center justify-between py-1.5 text-xs border-b border-neutral-100 last:border-0"
            >
              <span className="text-neutral-600">{s.desc}</span>
              <kbd className="px-2 py-1 bg-neutral-100 border border-neutral-200 rounded-md font-mono text-[11px] font-semibold text-neutral-800">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-3 border-t border-neutral-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
