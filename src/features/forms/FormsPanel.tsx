import { useState } from 'react';
import type { AddLog } from '../logs/logStore';

interface FormsPanelProps {
  addLog: AddLog;
}

const inputs = [
  { label: 'Text', type: 'text', autoComplete: 'name' },
  { label: 'Search', type: 'search', autoComplete: 'off' },
  { label: 'Email', type: 'email', autoComplete: 'email' },
  { label: 'Telephone', type: 'tel', autoComplete: 'tel' },
  { label: 'Number', type: 'number', autoComplete: 'off' },
  { label: 'Password', type: 'password', autoComplete: 'current-password' },
  { label: 'Date', type: 'date', autoComplete: 'off' },
  { label: 'Time', type: 'time', autoComplete: 'off' },
];

export function FormsPanel({ addLog }: FormsPanelProps) {
  const [composition, setComposition] = useState('idle');

  return (
    <section className="panel" aria-labelledby="forms-title">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Forms</p>
          <h2 id="forms-title">Keyboard Lab</h2>
        </div>
      </div>

      <div className="form-grid" data-testid="forms-panel">
        {inputs.map((input) => (
          <label key={input.label}>
            <span>{input.label}</span>
            <input
              type={input.type}
              autoComplete={input.autoComplete}
              placeholder={`${input.label} input`}
              onFocus={() => addLog('forms', 'info', `Focused ${input.label}`)}
              onBlur={() => addLog('forms', 'info', `Blurred ${input.label}`)}
            />
          </label>
        ))}
        <label className="form-grid__wide">
          <span>Korean composition, emoji, paste, long text</span>
          <textarea
            rows={5}
            placeholder="한글 조합, emoji, 긴 문자열, 붙여넣기 테스트"
            onCompositionStart={() => {
              setComposition('composing');
              addLog('forms', 'info', 'Composition started');
            }}
            onCompositionEnd={(event) => {
              setComposition('ended');
              addLog('forms', 'success', 'Composition ended', { value: event.currentTarget.value });
            }}
            onPaste={() => addLog('forms', 'info', 'Paste event detected')}
          />
        </label>
      </div>

      <div className="fixed-cta-probe">
        <span>Fixed bottom CTA probe</span>
        <strong>{composition}</strong>
      </div>
    </section>
  );
}
