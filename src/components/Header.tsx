"use client";

import { Moon, Redo2, Sun, Undo2 } from "lucide-react";

interface HeaderProps {
  tabId: string;
  activeTabsCount: number;
  theme: "light" | "dark";
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
    <header className="sticky top-0 z-40 w-full border-b border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-3 sm:px-6 lg:px-8 transition-all">
      <div className="mx-auto max-w-7xl flex items-center justify-between">

        {/* Workspace Brand */}
        <div className="flex items-center gap-2.5">
          {/* <div className="h-8 w-8 rounded-lg bg-[var(--primary)] flex items-center justify-center font-bold text-white text-sm">
            E
          </div> */}
          <div>
            <h1 className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
              EMI Calculator
            </h1>
            <p className="text-[10px] text-[var(--text-muted)] font-medium">with
              Shared Workspace</p>
          </div>
        </div>

        {/* Toolbar & Status */}
        <div className="flex items-center gap-4">
          {/* Connection status and live count */}
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
            {/* <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span> */}
            <span className="hidden sm:inline font-mono text-[var(--text-muted)]">{tabId}</span>
            <span className="text-[var(--text-muted)]">•</span>
            <span>{activeTabsCount} {activeTabsCount === 1 ? "tab active" : "tabs active"}</span>
          </div>

          <div className="h-4 w-px bg-[var(--card-border)]"></div>

          {/* Undo/Redo */}
          <div className="flex items-center rounded-lg border border-[var(--card-border)] overflow-hidden bg-[var(--card-bg)]">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className="p-1.5 text-[var(--text-secondary)] hover:bg-[var(--input-bg)] disabled:opacity-25 transition-colors border-r border-[var(--card-border)]"
            >
              <Undo2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
              className="p-1.5 text-[var(--text-secondary)] hover:bg-[var(--input-bg)] disabled:opacity-25 transition-colors"
            >
              <Redo2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Theme switcher */}
          <button
            onClick={onThemeToggle}
            className="p-2 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-secondary)] hover:bg-[var(--input-bg)] hover:text-[var(--text-primary)] transition-all"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
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
