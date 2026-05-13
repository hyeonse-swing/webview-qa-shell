import type { RuntimeSnapshot } from '../../shared/types';

interface DiagnosticsStripProps {
  snapshot: RuntimeSnapshot;
}

export function DiagnosticsStrip({ snapshot }: DiagnosticsStripProps) {
  return (
    <aside className="diagnostics-strip" aria-label="Runtime diagnostics">
      <span>{snapshot.viewport.innerWidth}x{snapshot.viewport.innerHeight}</span>
      <span>DPR {snapshot.devicePixelRatio}</span>
      <span>{snapshot.platformGuess}</span>
      <span>safe {snapshot.safeArea.bottom}px</span>
      <span>{snapshot.online ? 'online' : 'offline'}</span>
    </aside>
  );
}
