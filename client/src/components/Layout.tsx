import { type ReactNode } from 'react';
import { useUIStore, useSettingsStore } from '@/store';
import { Button } from './ui';
import { DISCLAIMER } from '@/constants';
import { cn } from '@/lib/utils';

export function Layout({ children }: { children: ReactNode }) {
  const view = useUIStore((s) => s.view);
  const setView = useUIStore((s) => s.setView);
  const darkMode = useSettingsStore((s) => s.darkMode);
  const setDarkMode = useSettingsStore((s) => s.setDarkMode);

  return (
    <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 py-6 md:py-8">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {view !== 'home' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setView('home')}
              aria-label="返回首页"
            >
              ←
            </Button>
          )}
          <h1 className="flex items-center gap-1.5 text-xl font-bold text-foreground">
            <span aria-hidden>🌸</span>
            <span>妙可儿的 HRT 成长日记</span>
          </h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDarkMode(!darkMode)}
          aria-label={darkMode ? '切换日间模式' : '切换夜间模式'}
          title={darkMode ? '日间模式' : '夜间模式'}
        >
          {darkMode ? '🌙' : '☀️'}
        </Button>
      </header>

      <main className="flex-1">
        <div key={view} className="fade-in">{children}</div>
      </main>

      <footer className="mt-10 border-t border-border pt-4 text-center">
        <p className="text-xs leading-relaxed text-muted-foreground">{DISCLAIMER}</p>
        <p className="mt-1 text-[11px] text-muted-foreground/70">
          数据仅存于本机浏览器 localStorage · 不上传网络
        </p>
      </footer>
    </div>
  );
}

export function LoadingSplash() {
  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center bg-background',
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="text-4xl heartbeat" aria-hidden>🌸</div>
        <p className="text-sm text-muted-foreground">正在唤醒你的小天地…</p>
      </div>
    </div>
  );
}
