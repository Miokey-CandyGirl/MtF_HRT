import { useEffect, useRef } from 'react';
import { useSettingsStore } from '@/store';
import { DENSITY_OPTIONS } from '@/constants';

interface Petal {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  sway: number;
  swaySpeed: number;
  phase: number;
  rot: number;
  rotSpeed: number;
  char: string;
  alpha: number;
}

const CHARS = ['🌸', '🌸', '🌸', '💖', '✨', '🎀'];

/** 樱花飘落粒子层（canvas 固定层，密度可调，尊重 reduced-motion） */
export function ParticleLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useSettingsStore((s) => s.particles);
  const density = useSettingsStore((s) => s.density);
  const particlesRef = useRef(particles);
  const densityRef = useRef(density);

  useEffect(() => {
    particlesRef.current = particles;
  }, [particles]);
  useEffect(() => {
    densityRef.current = density;
  }, [density]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let petals: Petal[] = [];
    let w = 0;
    let h = 0;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const countFor = () => {
      const opt = DENSITY_OPTIONS.find((o) => o.value === densityRef.current);
      return opt ? opt.count : 24;
    };

    const spawn = (n: number) => {
      petals = [];
      for (let i = 0; i < n; i++) petals.push(makePetal(w, h, true));
    };

    const tick = () => {
      if (!particlesRef.current || reduce) {
        ctx.clearRect(0, 0, w, h);
        raf = requestAnimationFrame(tick);
        return;
      }
      ctx.clearRect(0, 0, w, h);
      const target = countFor();
      if (petals.length !== target) spawn(target);
      petals.forEach((p) => {
        p.phase += p.swaySpeed;
        p.x += p.speedX + Math.sin(p.phase) * p.sway;
        p.y += p.speedY;
        p.rot += p.rotSpeed;
        if (p.y > h + 20) {
          Object.assign(p, makePetal(w, h, false));
        }
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.font = `${p.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.char, 0, 0);
        ctx.restore();
      });
      raf = requestAnimationFrame(tick);
    };

    spawn(countFor());
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity: 0.85 }}
    />
  );
}

function makePetal(w: number, h: number, anywhere: boolean): Petal {
  return {
    x: Math.random() * w,
    y: anywhere ? Math.random() * h : -20,
    size: 12 + Math.random() * 14,
    speedY: 0.4 + Math.random() * 0.9,
    speedX: -0.2 + Math.random() * 0.4,
    sway: 0.4 + Math.random() * 0.8,
    swaySpeed: 0.01 + Math.random() * 0.02,
    phase: Math.random() * Math.PI * 2,
    rot: Math.random() * Math.PI * 2,
    rotSpeed: -0.02 + Math.random() * 0.04,
    char: CHARS[Math.floor(Math.random() * CHARS.length)],
    alpha: 0.5 + Math.random() * 0.5,
  };
}
