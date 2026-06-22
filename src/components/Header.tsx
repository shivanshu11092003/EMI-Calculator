'use client';

import {Moon, Redo2, Sun, Undo2} from 'lucide-react';

interface HeaderProps {
  tabId: string;
  activeTabsCount: number;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export default function Header({
  tabId,
  activeTabsCount,
  theme,
  onThemeToggle,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-[var(--card-border)] border-b bg-[var(--card-bg)] px-4 py-3 transition-all sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Workspace Brand */}
        <div className="flex items-center gap-2.5">
          {/* <div className="h-8 w-8 rounded-lg bg-[var(--primary)] flex items-center justify-center font-bold text-white text-sm">
            E
          </div> */}
          <div>
            <h1 className="font-bold text-[var(--text-primary)] text-sm tracking-tight">
              EMI Calculator
            </h1>
            <p className="font-medium text-[10px] text-[var(--text-muted)]">
              with Shared Workspace
            </p>
          </div>
        </div>

        {/* Toolbar & Status */}
        <div className="flex items-center gap-4">
          {/* Connection status and live count */}
          <div className="flex items-center gap-2 font-semibold text-[var(--text-secondary)] text-xs">
            {/* <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
            </span> */}
            <span className="hidden font-mono text-[var(--text-muted)] sm:inline">
              {tabId}
            </span>
            <span className="text-[var(--text-muted)]">•</span>
            <span>
              {activeTabsCount}{' '}
              {activeTabsCount === 1 ? 'tab active' : 'tabs active'}
            </span>
          </div>

          <div className="h-4 w-px bg-[var(--card-border)]"></div>

          {/* Undo/Redo */}
          <div className="flex items-center overflow-hidden rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)]">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className="border-[var(--card-border)] border-r p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--input-bg)] disabled:opacity-25"
            >
              <Undo2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
              className="p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--input-bg)] disabled:opacity-25"
            >
              <Redo2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Theme switcher */}
          <button
            type="button"
            onClick={onThemeToggle}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-2 text-[var(--text-secondary)] transition-all hover:bg-[var(--input-bg)] hover:text-[var(--text-primary)]"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-3.5 w-3.5 text-amber-400" />
            ) : (
              <Moon className="h-3.5 w-3.5 text-indigo-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
