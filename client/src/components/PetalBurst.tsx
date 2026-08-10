// 打卡花瓣爆开动效：在指定坐标触发短暂时花瓣迸发

let container: HTMLDivElement | null = null;

function ensureContainer(): HTMLDivElement {
  if (container && document.body.contains(container)) return container;
  container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.inset = '0';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '60';
  document.body.appendChild(container);
  return container;
}

const BURST_CHARS = ['🌸', '🌸', '💖', '✨', '🎀'];

/** 在 (x,y) 屏幕坐标触发花瓣爆开 */
export function triggerPetalBurst(x: number, y: number) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const root = ensureContainer();
  const n = 12;
  for (let i = 0; i < n; i++) {
    const el = document.createElement('span');
    el.textContent = BURST_CHARS[Math.floor(Math.random() * BURST_CHARS.length)];
    el.style.position = 'absolute';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.fontSize = `${14 + Math.random() * 12}px`;
    el.style.transform = 'translate(-50%, -50%) scale(0.4)';
    el.style.opacity = '1';
    el.style.transition = 'transform 600ms cubic-bezier(0.2,0.8,0.3,1), opacity 600ms ease-out';
    root.appendChild(el);
    const angle = (Math.PI * 2 * i) / n + Math.random() * 0.4;
    const dist = 50 + Math.random() * 60;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist - 20; // 略向上
    requestAnimationFrame(() => {
      el.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1.2) rotate(${Math.random() * 360}deg)`;
      el.style.opacity = '0';
    });
    setTimeout(() => el.remove(), 650);
  }
}
