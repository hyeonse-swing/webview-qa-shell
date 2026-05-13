import { ExternalLink } from 'lucide-react';
import { deeplinkTargets, openDeeplink } from './deeplink';
import type { AddLog } from '../logs/logStore';

interface DeeplinkPanelProps {
  addLog: AddLog;
}

export function DeeplinkPanel({ addLog }: DeeplinkPanelProps) {
  const runTarget = (index: number) => {
    const target = deeplinkTargets[index];
    const startedAt = performance.now();

    addLog('deeplink', 'info', `Opening ${target.label}`, target);

    setTimeout(() => {
      addLog('deeplink', 'warning', `Fallback timer reached for ${target.label}`, {
        elapsedMs: Math.round(performance.now() - startedAt),
        visibilityState: document.visibilityState,
      });
    }, 1_500);

    const mode = openDeeplink(target);
    addLog('deeplink', 'info', `Open mode: ${mode}`);
  };

  return (
    <section className="panel" aria-labelledby="deeplink-title">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Deep Links</p>
          <h2 id="deeplink-title">Scheme and Fallback Tests</h2>
        </div>
      </div>

      <div className="table-list" data-testid="deeplink-panel">
        {deeplinkTargets.map((target, index) => (
          <div className="table-row" key={`${target.label}-${target.url}`}>
            <div className="table-row__title">
              <ExternalLink size={18} />
              <strong>{target.label}</strong>
              <small>{target.url}</small>
            </div>
            <span className="status">{target.mode}</span>
            <button type="button" onClick={() => runTarget(index)}>
              Open
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
