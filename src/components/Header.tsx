'use client';

import {Badge, Button, Tooltip} from 'antd';
import {Calculator, Moon, Redo2, Sun, Undo2, Users} from 'lucide-react';

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
    <header className="sticky top-0 z-50 w-full border-[var(--card-border)] border-b bg-[var(--card-bg)]/85 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Workspace Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)] text-white shadow-[0_3px_8px_rgba(37,99,235,0.15)]">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-black text-[var(--primary)] text-sm tracking-tight">
                EMI Calculator
              </h1>
            </div>
            <p className="font-medium text-[10px] text-[var(--text-muted)]">
              Collaborative Shared Workspace
            </p>
          </div>
        </div>

        {/* Toolbar & Live Collaboration Status */}
        <div className="flex items-center gap-4">
          {/* Active Presence Status */}
          <div className="flex items-center gap-3 rounded-full border border-[var(--card-border)] bg-[var(--input-bg)]/40 px-3 py-1.5">
            {/* Live Indicator */}

            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
              <Badge
                count={activeTabsCount}
                style={{
                  backgroundColor: 'var(--primary)',
                  fontSize: '9px',
                  height: '16px',
                  minWidth: '16px',
                  lineHeight: '16px',
                  borderRadius: '8px',
                }}
              >
                <span className="pr-2 font-semibold text-[var(--text-primary)] text-xs">
                  {activeTabsCount === 1 ? 'Tab' : 'Tabs'}
                </span>
              </Badge>
            </div>
          </div>

          <div className="h-5 w-px bg-[var(--card-border)]"></div>

          {/* Undo/Redo & Theme Controls */}
          <div className="flex items-center gap-1.5">
            <Tooltip title="Undo (Ctrl+Z)" mouseEnterDelay={0.5}>
              <Button
                type="text"
                shape="circle"
                disabled={!canUndo}
                onClick={onUndo}
                className="flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--input-bg)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:hover:bg-transparent"
                icon={<Undo2 className="h-4 w-4" />}
              />
            </Tooltip>

            <Tooltip title="Redo (Ctrl+Y)" mouseEnterDelay={0.5}>
              <Button
                type="text"
                shape="circle"
                disabled={!canRedo}
                onClick={onRedo}
                className="flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--input-bg)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:hover:bg-transparent"
                icon={<Redo2 className="h-4 w-4" />}
              />
            </Tooltip>

            <div className="mx-1 h-4 w-px bg-[var(--card-border)]"></div>

            <Tooltip
              title={
                theme === 'dark'
                  ? 'Switch to Light Mode'
                  : 'Switch to Dark Mode'
              }
              mouseEnterDelay={0.5}
            >
              <Button
                type="text"
                shape="circle"
                onClick={onThemeToggle}
                className="flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--input-bg)]"
                icon={
                  theme === 'dark' ? (
                    <Sun className="h-4 w-4 text-amber-500" />
                  ) : (
                    <Moon className="h-4 w-4 text-indigo-500" />
                  )
                }
              />
            </Tooltip>
          </div>
        </div>
      </div>
    </header>
  );
}
