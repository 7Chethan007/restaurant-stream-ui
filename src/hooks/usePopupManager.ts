/** Draggable popup position, same approach as POD's usePopupManager. */
import { useCallback, useEffect, useRef, useState } from 'react';

const POPUP_W = 420;

export function usePopupManager() {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const card = (e.currentTarget as HTMLElement).closest('.draggable-popup');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setPosition({ x: rect.left, y: rect.top });
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const move = (e: PointerEvent) => {
      const maxX = window.innerWidth - Math.min(POPUP_W, window.innerWidth);
      const maxY = window.innerHeight - 80;
      setPosition({
        x: Math.max(0, Math.min(e.clientX - offset.current.x, maxX)),
        y: Math.max(0, Math.min(e.clientY - offset.current.y, maxY)),
      });
    };
    const up = () => setIsDragging(false);
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
    return () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
    };
  }, [isDragging]);

  /** null = default docked position (CSS decides). */
  const resetPosition = useCallback(() => setPosition(null), []);

  return { position, isDragging, handlePointerDown, resetPosition };
}
