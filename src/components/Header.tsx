'use client';

import {
  MoonOutlined,
  RedoOutlined,
  SunOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import {Button, Tooltip} from 'antd';
import {Users} from 'lucide-react';

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
  tabId: _tabId,
  activeTabsCount,
  theme,
  onThemeToggle,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: HeaderProps) {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 py-3">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between gap-2 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)]/95 px-5 py-2.5 shadow-sm backdrop-blur-md transition-all duration-300">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="flex items-center gap-2 font-bold text-sm tracking-tight decoration-none"
            >
              <span className="hidden font-semibold text-[var(--text-primary)] leading-none sm:block">
                CALCI
                <span className="mt-0.5 block font-normal text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                  EMI Calculator
                </span>
              </span>
            </a>
          </div>

          {/* Right: Collaboration Status, Undo/Redo & Theme Toggle */}
          <div className="flex items-center gap-2.5 rounded-xl border border-[var(--card-border)]/50 bg-[var(--input-bg)]/40 px-3 py-1">
            {/* Presence Count */}
            <Tooltip title={`${activeTabsCount} active tabs sharing workspace`}>
              <div className="flex items-center gap-1.5 px-1 font-semibold text-[var(--text-secondary)] text-xs">
                <Users className="h-3.5 w-3.5" />
                <span className="text-[11px]">{activeTabsCount}</span>
              </div>
            </Tooltip>

            {/* Divider */}
            <div className="h-4 w-px bg-[var(--card-border)]" />

            {/* Undo */}
            <Tooltip title="Undo (Ctrl+Z)" mouseEnterDelay={0.5}>
              <Button
                type="text"
                shape="circle"
                disabled={!canUndo}
                onClick={onUndo}
                className="flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--input-bg)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:hover:bg-transparent"
                icon={<UndoOutlined style={{fontSize: '12px'}} />}
                size="small"
              />
            </Tooltip>

            {/* Redo */}
            <Tooltip title="Redo (Ctrl+Y)" mouseEnterDelay={0.5}>
              <Button
                type="text"
                shape="circle"
                disabled={!canRedo}
                onClick={onRedo}
                className="flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--input-bg)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:hover:bg-transparent"
                icon={<RedoOutlined style={{fontSize: '12px'}} />}
                size="small"
              />
            </Tooltip>

            {/* Divider */}
            <div className="h-4 w-px bg-[var(--card-border)]" />

            {/* Theme Toggle */}
            <Tooltip
              title={
                theme === 'dark'
                  ? 'Switch to Light Mode'
                  : 'Switch to Dark Mode'
              }
              placement="bottom"
            >
              <button
                type="button"
                onClick={onThemeToggle}
                className="flex cursor-pointer select-none items-center gap-1.5 rounded-lg border border-[var(--card-border)] bg-[var(--input-bg)]/50 bg-transparent px-2.5 py-1.5 font-medium text-[var(--text-primary)] text-xs transition-all duration-200 hover:border-[var(--card-border)] hover:bg-[var(--input-bg)]"
              >
                {theme === 'dark' ? (
                  <>
                    <SunOutlined className="text-amber-500" />
                    <span className="hidden font-semibold text-[var(--text-primary)] sm:inline">
                      Light
                    </span>
                  </>
                ) : (
                  <>
                    <MoonOutlined className="text-indigo-500" />
                    <span className="hidden font-semibold text-[var(--text-primary)] sm:inline">
                      Dark
                    </span>
                  </>
                )}
              </button>
            </Tooltip>
          </div>
        </nav>
      </div>
    </header>
  );
}
