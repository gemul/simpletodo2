import React, { useState } from 'react';
import { Task } from '../types';
import { X, Copy, Check, Download, Upload, RotateCcw } from 'lucide-react';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onImportTasks: (tasks: Task[]) => void;
  onResetTasks: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onImportTasks,
  onResetTasks,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'reset'>('export');
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');

  if (!isOpen) return null;

  const jsonString = JSON.stringify(tasks, null, 2);

  const getMarkdownChecklist = () => {
    return tasks
      .map((t) => {
        const check = t.completed ? '[x]' : '[ ]';
        const meta: string[] = [];
        if (t.priority !== 'none') meta.push(`priority: ${t.priority}`);
        if (t.dueDate) meta.push(`due: ${t.dueDate}`);
        if (t.category) meta.push(`category: ${t.category}`);
        const metaStr = meta.length > 0 ? ` (${meta.join(', ')})` : '';
        const desc = t.description ? `\n  > ${t.description}` : '';
        return `- ${check} ${t.title}${metaStr}${desc}`;
      })
      .join('\n');
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    setImportError('');
    try {
      const parsed = JSON.parse(importText);
      if (!Array.isArray(parsed)) {
        throw new Error('Data must be an array of tasks.');
      }
      // Basic validation
      const valid = parsed.every((t) => typeof t.id === 'string' && typeof t.title === 'string');
      if (!valid) {
        throw new Error('Each task item must have at least an "id" and a "title".');
      }
      onImportTasks(parsed as Task[]);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setImportError(err.message);
      } else {
        setImportError('Invalid JSON format');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white border border-neutral-200 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <h2 className="text-base font-bold text-neutral-900">
            Backup & Data Management
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 mt-4 p-1 bg-neutral-100 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-1.5 rounded-md transition-colors ${
              activeTab === 'export'
                ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Export Backup
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-1.5 rounded-md transition-colors ${
              activeTab === 'import'
                ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Import Data
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reset')}
            className={`flex-1 py-1.5 rounded-md transition-colors ${
              activeTab === 'reset'
                ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Reset
          </button>
        </div>

        {/* Tab Contents */}
        <div className="mt-4">
          {activeTab === 'export' && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-600">
                Your data is stored locally in your browser. You can export it as JSON or Markdown to keep a safe backup.
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="px-3 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .json file</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy(jsonString)}
                  className="px-3 py-2 bg-white border border-neutral-200 text-neutral-700 rounded-lg text-xs font-medium hover:bg-neutral-50 transition-colors flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied JSON' : 'Copy JSON'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy(getMarkdownChecklist())}
                  className="px-3 py-2 bg-white border border-neutral-200 text-neutral-700 rounded-lg text-xs font-medium hover:bg-neutral-50 transition-colors flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Markdown</span>
                </button>
              </div>

              <textarea
                readOnly
                value={jsonString}
                rows={6}
                className="w-full text-xs font-mono bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-neutral-700 outline-none"
              />
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-3">
              <p className="text-xs text-neutral-600">
                Paste a valid TaskFlow JSON array below to restore your tasks:
              </p>

              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="[ { id: '...', title: '...' } ]"
                rows={7}
                className="w-full text-xs font-mono bg-white border border-neutral-300 rounded-lg p-3 text-neutral-800 outline-none focus:border-neutral-500"
              />

              {importError && (
                <div className="text-xs text-red-600 font-medium">
                  {importError}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={!importText.trim()}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import Tasks</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'reset' && (
            <div className="space-y-3 py-2">
              <p className="text-xs text-neutral-600">
                Want to start fresh or try out the initial sample tasks? This will overwrite your current task list with the initial starter tasks.
              </p>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Reset all tasks to sample initial tasks?')) {
                      onResetTasks();
                      onClose();
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Sample Tasks</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
