import { useEffect, useState } from 'react';
import { api } from '../utils/api';

export function useBackendHealth(intervalMs = 10_000) {
  const [online, setOnline] = useState<boolean | null>(null);
  useEffect(() => {
    let alive = true;
    const check = async () => {
      const ok = await api.health();
      if (alive) setOnline(ok);
    };
    check();
    const id = setInterval(check, intervalMs);
    return () => { alive = false; clearInterval(id); };
  }, [intervalMs]);
  return online;
}
