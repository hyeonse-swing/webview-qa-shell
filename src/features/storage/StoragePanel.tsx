import { useState } from 'react';
import { Database } from 'lucide-react';
import { runStorageChecks, type StorageCheckResult } from './storage';
import type { AddLog } from '../logs/logStore';

interface StoragePanelProps {
  addLog: AddLog;
}

export function StoragePanel({ addLog }: StoragePanelProps) {
  const [results, setResults] = useState<StorageCheckResult[]>([]);

  const run = async () => {
    const next = await runStorageChecks();
    setResults(next);
    addLog('storage', 'success', 'Storage checks completed', next);
  };

  return (
    <section className="panel" aria-labelledby="storage-title">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Storage</p>
          <h2 id="storage-title">Persistence Checks</h2>
        </div>
        <button type="button" onClick={run}>
          <Database size={16} />
          Run Checks
        </button>
      </div>

      <div className="table-list" data-testid="storage-panel">
        {results.length === 0 ? (
          <p className="muted">Run checks to test localStorage, sessionStorage, IndexedDB, and cookies.</p>
        ) : (
          results.map((result) => (
            <div className="table-row" key={result.name}>
              <div className="table-row__title">
                <strong>{result.name}</strong>
                <small>{result.error ?? result.value ?? 'no value'}</small>
              </div>
              <span className={result.supported ? 'status status--pass' : 'status status--fail'}>
                {result.supported ? 'supported' : 'blocked'}
              </span>
              <span className={result.persisted ? 'status status--pass' : 'status status--warn'}>
                {result.persisted ? 'persisted' : 'not persisted'}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
