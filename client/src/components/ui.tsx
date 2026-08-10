import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ===== Card =====
export function Card({ className, children, ...rest }: { className?: string; children: ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card p-5 card-shadow',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ emoji, title, desc, right }: { emoji?: string; title: string; desc?: string; right?: ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          {emoji && <span aria-hidden>{emoji}</span>}
          {title}
        </h2>
        {desc && <p className="mt-1 text-sm text-muted-foreground">{desc}</p>}
      </div>
      {right}
    </div>
  );
}

// ===== Button =====
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 rounded-full font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97]',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:brightness-105 hover:shadow-md',
        secondary: 'border border-primary text-primary bg-transparent hover:bg-accent',
        ghost: 'text-foreground hover:bg-accent',
        danger: 'bg-destructive text-white hover:brightness-105',
        subtle: 'bg-accent text-accent-foreground hover:brightness-105',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-5 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...rest }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...rest} />
  ),
);
Button.displayName = 'Button';

// ===== Input / Textarea / Select / Label =====
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...rest }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30',
        className,
      )}
      {...rest}
    />
  ),
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...rest }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30',
        className,
      )}
      {...rest}
    />
  ),
);
Textarea.displayName = 'Textarea';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...rest }, ref) => (
    <select
      ref={ref}
      className={cn(
        'h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30',
        className,
      )}
      {...rest}
    >
      {children}
    </select>
  ),
);
Select.displayName = 'Select';

export function Label({ children, className, htmlFor }: { children: ReactNode; className?: string; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className={cn('mb-1 block text-sm font-medium text-foreground', className)}>
      {children}
    </label>
  );
}

export function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-destructive">{msg}</p>;
}

// ===== Progress (粉色圆角) =====
export function Progress({ value, className, withFlower }: { value: number; className?: string; withFlower?: boolean }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={cn('relative h-3 w-full overflow-hidden rounded-full bg-accent', className)}>
      <div
        className="h-full rounded-full bg-primary transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
      {withFlower && pct > 8 && (
        <span className="absolute top-1/2 -translate-y-1/2 text-xs" style={{ left: `calc(${pct}% - 8px)` }} aria-hidden>
          🌸
        </span>
      )}
    </div>
  );
}

// ===== Switch =====
export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        checked ? 'bg-primary' : 'bg-border',
      )}
    >
      <span
        className={cn(
          'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}

// ===== Tabs (受控) =====
export function Tabs({ tabs, value, onChange }: { tabs: { value: string; label: string; emoji?: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 rounded-2xl bg-accent/50 p-1.5">
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onChange(t.value)}
          className={cn(
            'flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition-all',
            value === t.value
              ? 'bg-card text-primary card-shadow'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {t.emoji && <span className="mr-1" aria-hidden>{t.emoji}</span>}
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ===== EmptyState =====
export function EmptyState({ emoji, title, desc, action }: { emoji: string; title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
      <div className="mb-3 text-4xl" aria-hidden>{emoji}</div>
      <p className="font-semibold text-foreground">{title}</p>
      {desc && <p className="mt-1 max-w-xs text-sm text-muted-foreground">{desc}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ===== Chip =====
export function Chip({ children, active, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-3 py-1 text-xs font-medium transition-colors',
        active ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground hover:bg-primary/20',
      )}
    >
      {children}
    </button>
  );
}

// ===== Modal =====
export function Modal({ open, onClose, title, children, footer, maxWidth = 'max-w-md' }: { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode; footer?: ReactNode; maxWidth?: string }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className={cn('relative z-10 w-full rounded-2xl border border-border bg-card p-5 card-shadow pop-in', maxWidth)}>
        {title && <h3 className="mb-3 text-lg font-bold text-foreground">{title}</h3>}
        <div className="text-sm text-foreground">{children}</div>
        {footer && <div className="mt-4 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

// ===== ConfirmDialog =====
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmText = '确定', cancelText = '取消', danger }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: ReactNode; confirmText?: string; cancelText?: string; danger?: boolean }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>{cancelText}</Button>
          <Button variant={danger ? 'danger' : 'primary'} size="sm" onClick={() => { onConfirm(); onClose(); }}>{confirmText}</Button>
        </>
      }
    >
      {message}
    </Modal>
  );
}

// ===== Stat 小方块 =====
export function Stat({ label, value, emoji }: { label: string; value: ReactNode; emoji?: string }) {
  return (
    <div className="rounded-2xl bg-card p-4 card-shadow">
      <div className="text-xs text-muted-foreground">{emoji && <span className="mr-1" aria-hidden>{emoji}</span>}{label}</div>
      <div className="mt-1 text-2xl font-bold text-primary tnum">{value}</div>
    </div>
  );
}
