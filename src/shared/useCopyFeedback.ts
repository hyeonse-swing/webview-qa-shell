import { useRef, useState } from 'react';
import type { AddLog } from '../features/logs/logStore';
import { copyText } from './qaReport';

export function useCopyFeedback(source: string, success: string, failure: string, addLog: AddLog) {
  const copying = useRef(false);
  const [feedback, setFeedback] = useState({ text: '', failed: false, pending: false });

  const copy = async (text: string) => {
    if (copying.current) return;
    copying.current = true;
    setFeedback({ text: 'Copying…', failed: false, pending: true });
    try {
      await copyText(text);
      addLog(source, 'success', success);
      setFeedback({ text: success, failed: false, pending: false });
    } catch (error) {
      addLog(source, 'error', failure, {
        error: error instanceof Error ? error.message : String(error),
      });
      setFeedback({ text: failure, failed: true, pending: false });
    } finally {
      copying.current = false;
    }
  };

  return { copy, feedback };
}
