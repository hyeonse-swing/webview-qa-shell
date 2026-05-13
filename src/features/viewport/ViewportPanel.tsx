import { Ruler } from 'lucide-react';
import { formatJson } from '../../shared/format';
import type { RuntimeSnapshot } from '../../shared/types';
import type { AddLog } from '../logs/logStore';

interface ViewportPanelProps {
  snapshot: RuntimeSnapshot;
  addLog: AddLog;
}

export function ViewportPanel({ snapshot, addLog }: ViewportPanelProps) {
  const recordSnapshot = () => {
    addLog('viewport', 'info', 'Recorded viewport snapshot', snapshot.viewport);
  };

  return (
    <section className="panel" aria-labelledby="viewport-title">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Viewport & Insets</p>
          <h2 id="viewport-title">Safe-area Lab</h2>
        </div>
        <button type="button" onClick={recordSnapshot}>
          <Ruler size={16} />
          Log Snapshot
        </button>
      </div>

      <div className="device-stage" data-testid="safe-area-lab">
        <div className="safe-guide safe-guide--top">top {snapshot.safeArea.top}px</div>
        <div className="safe-guide safe-guide--right">right {snapshot.safeArea.right}px</div>
        <div className="safe-guide safe-guide--bottom">bottom {snapshot.safeArea.bottom}px</div>
        <div className="safe-guide safe-guide--left">left {snapshot.safeArea.left}px</div>
        <div className="device-stage__content">
          <strong>Fixed content probe</strong>
          <span>{snapshot.viewport.innerWidth} x {snapshot.viewport.innerHeight}</span>
        </div>
      </div>

      <div className="unit-row">
        <div style={{ height: '100vh' }}>100vh</div>
        <div style={{ height: '100dvh' }}>100dvh</div>
        <div style={{ height: '100svh' }}>100svh</div>
        <div style={{ height: '100lvh' }}>100lvh</div>
      </div>

      <div className="data-box">
        <h3>Raw viewport data</h3>
        <pre>{formatJson({ viewport: snapshot.viewport, screen: snapshot.screen, safeArea: snapshot.safeArea })}</pre>
      </div>
    </section>
  );
}
