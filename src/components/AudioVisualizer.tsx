/** Live time-domain waveform, same drawing approach as POD's AudioVisualizer.tsx. */
import { useEffect, useRef } from 'react';

interface Props {
  isActive: boolean;
  strokeColor?: string;
  idleColor?: string;
  height?: number;
}

export function AudioVisualizer({ isActive, strokeColor = '#e67e22', idleColor = '#d6d6d6', height = 28 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    let stream: MediaStream | null = null;
    let audioCtx: AudioContext | null = null;
    let cancelled = false;

    const fit = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return rect;
    };

    const flat = () => {
      const rect = fit();
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.strokeStyle = idleColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, rect.height / 2);
      ctx.lineTo(rect.width, rect.height / 2);
      ctx.stroke();
    };

    if (!isActive) {
      flat();
      return;
    }

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        audioCtx = new AudioContext();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 1024;
        audioCtx.createMediaStreamSource(stream).connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);
        const draw = () => {
          const rect = fit();
          analyser.getByteTimeDomainData(data);
          ctx.clearRect(0, 0, rect.width, rect.height);
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          const slice = rect.width / data.length;
          for (let i = 0; i < data.length; i++) {
            const y = (data[i] / 128) * (rect.height / 2);
            if (i === 0) ctx.moveTo(0, y); else ctx.lineTo(i * slice, y);
          }
          ctx.stroke();
          raf = requestAnimationFrame(draw);
        };
        draw();
      } catch {
        flat(); // mic blocked: speech status shows the reason
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
      audioCtx?.close();
    };
  }, [isActive, strokeColor, idleColor]);

  return <canvas ref={canvasRef} className="visualizer" style={{ height }} aria-hidden="true" />;
}
