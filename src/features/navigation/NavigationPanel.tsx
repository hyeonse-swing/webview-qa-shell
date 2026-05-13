import { ArrowLeft, ArrowRight, Hash, RefreshCw, Replace } from 'lucide-react';
import { pushHistoryState, replaceHistoryState, setHashNavigation } from './navigation';
import type { AddLog } from '../logs/logStore';

interface NavigationPanelProps {
  addLog: AddLog;
}

export function NavigationPanel({ addLog }: NavigationPanelProps) {
  const run = (label: string, action: () => unknown) => {
    try {
      const result = action();
      addLog('navigation', 'success', label, result);
    } catch (error) {
      addLog('navigation', 'error', `${label} failed`, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  return (
    <section className="panel" aria-labelledby="navigation-title">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Navigation</p>
          <h2 id="navigation-title">History and Window Tests</h2>
        </div>
      </div>

      <div className="action-grid" data-testid="navigation-panel">
        <button type="button" onClick={() => run('pushState', () => pushHistoryState('push'))}>
          <ArrowRight size={16} />
          pushState
        </button>
        <button type="button" onClick={() => run('replaceState', () => replaceHistoryState('replace'))}>
          <Replace size={16} />
          replaceState
        </button>
        <button type="button" onClick={() => run('hash navigation', () => setHashNavigation('hash'))}>
          <Hash size={16} />
          hash
        </button>
        <button type="button" onClick={() => run('history.back', () => window.history.back())}>
          <ArrowLeft size={16} />
          back
        </button>
        <button type="button" onClick={() => run('history.forward', () => window.history.forward())}>
          <ArrowRight size={16} />
          forward
        </button>
        <button type="button" onClick={() => run('reload', () => window.location.reload())}>
          <RefreshCw size={16} />
          reload
        </button>
        <button type="button" onClick={() => run('window.open', () => window.open('https://example.com', '_blank', 'noopener,noreferrer'))}>
          <ArrowRight size={16} />
          window.open
        </button>
      </div>

      <iframe className="test-iframe" title="Navigation iframe probe" srcDoc="<p>iframe navigation probe</p>" />
    </section>
  );
}
