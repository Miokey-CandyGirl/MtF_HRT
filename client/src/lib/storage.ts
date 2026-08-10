// localStorage 统一管理：命名空间 hrt:，安全解析，导出/导入备份

export const STORAGE_KEYS = [
  'hrt:medication',
  'hrt:annual',
  'hrt:hormones',
  'hrt:bodySigns',
  'hrt:sideEffects',
  'hrt:medicalArchive',
  'hrt:savings',
  'hrt:reminders',
  'hrt:mood',
  'hrt:dysphoria',
  'hrt:psychNotes',
  'hrt:achievements',
  'hrt:badges',
  'hrt:meta',
  'hrt:settings',
] as const;

/** 列表型 store 键（导入追加时按 id 合并） */
const LIST_KEYS = new Set([
  'hrt:hormones',
  'hrt:bodySigns',
  'hrt:sideEffects',
  'hrt:savings',
  'hrt:reminders',
  'hrt:mood',
  'hrt:dysphoria',
  'hrt:achievements',
]);

export interface BackupPayload {
  version: number;
  exportedAt: string;
  data: Record<string, string | null>;
}

/** 安全 JSON 解析 */
export function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** 导出全部业务数据 */
export function exportAll(): BackupPayload {
  const data: Record<string, string | null> = {};
  STORAGE_KEYS.forEach((k) => {
    data[k] = localStorage.getItem(k);
  });
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  };
}

/** 清空全部业务数据（保留设置可选） */
export function clearAll(keepSettings = false) {
  STORAGE_KEYS.forEach((k) => {
    if (keepSettings && k === 'hrt:settings') return;
    localStorage.removeItem(k);
  });
}

/** 导入备份 */
export function importBackup(
  payload: BackupPayload,
  mode: 'overwrite' | 'append',
): void {
  if (!payload || typeof payload !== 'object' || !payload.data) {
    throw new Error('备份文件格式不正确');
  }

  if (mode === 'overwrite') {
    // 覆盖：先清空，再写入（null 表示该项清空）
    STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
    STORAGE_KEYS.forEach((k) => {
      const v = payload.data[k];
      if (v != null) localStorage.setItem(k, v);
    });
    return;
  }

  // 追加：列表按 id 合并；其余键已有则保留，无则写入
  LIST_KEYS.forEach((k) => {
    const incoming = payload.data[k];
    if (!incoming) return;
    const incomingItems = safeParse<{ id: string }[]>(incoming, []);
    if (!Array.isArray(incomingItems)) return;
    const existing = safeParse<{ id: string }[]>(localStorage.getItem(k), []);
    const map = new Map<string, { id: string }>();
    existing.forEach((it) => map.set(it.id, it));
    incomingItems.forEach((it) => {
      if (!map.has(it.id)) map.set(it.id, it); // 仅追加新条目
    });
    localStorage.setItem(k, JSON.stringify(Array.from(map.values())));
  });

  // badges 合并（并集，保留最早解锁时间）
  const badgesIncoming = payload.data['hrt:badges'];
  if (badgesIncoming) {
    const incoming = safeParse<Record<string, { unlockedAt: string }>>(badgesIncoming, {});
    const existing = safeParse<Record<string, { unlockedAt: string }>>(
      localStorage.getItem('hrt:badges'),
      {},
    );
    const merged = { ...incoming };
    Object.keys(existing).forEach((id) => {
      if (merged[id]) {
        merged[id] = {
          unlockedAt: [merged[id].unlockedAt, existing[id].unlockedAt]
            .sort()[0],
        };
      } else {
        merged[id] = existing[id];
      }
    });
    localStorage.setItem('hrt:badges', JSON.stringify(merged));
  }

  // 文本/对象键：已有则保留，无则写入
  ['hrt:medicalArchive', 'hrt:psychNotes', 'hrt:medication', 'hrt:annual', 'hrt:meta'].forEach(
    (k) => {
      if (localStorage.getItem(k) == null && payload.data[k] != null) {
        localStorage.setItem(k, payload.data[k] as string);
      }
    },
  );
}

/** 校验备份文件是否合法 */
export function validateBackup(payload: unknown): payload is BackupPayload {
  if (!payload || typeof payload !== 'object') return false;
  const p = payload as Record<string, unknown>;
  return p.version !== undefined && p.data !== undefined && typeof p.data === 'object';
}
