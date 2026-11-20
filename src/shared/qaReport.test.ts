import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyText } from './qaReport';

afterEach(() => vi.unstubAllGlobals());

describe('copyText', () => {
  it('uses the browser clipboard when available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    await expect(copyText('QA report')).resolves.toBe('clipboard');
    expect(writeText).toHaveBeenCalledWith('QA report');
  });

  it('reports a failed legacy copy and removes the temporary field', async () => {
    const textarea = { value: '', style: {}, setAttribute: vi.fn(), select: vi.fn(), remove: vi.fn() };
    const execCommand = vi.fn().mockReturnValue(false);
    vi.stubGlobal('navigator', {});
    vi.stubGlobal('document', {
      createElement: vi.fn().mockReturnValue(textarea),
      body: { appendChild: vi.fn() },
      execCommand,
    });

    await expect(copyText('QA report')).rejects.toThrow('Copy failed');
    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(textarea.remove).toHaveBeenCalledOnce();
  });

  it('uses legacy copy if clipboard access is denied', async () => {
    const textarea = { value: '', style: {}, setAttribute: vi.fn(), select: vi.fn(), remove: vi.fn() };
    const writeText = vi.fn().mockRejectedValue(new Error('Clipboard denied'));
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    vi.stubGlobal('document', {
      createElement: vi.fn().mockReturnValue(textarea),
      body: { appendChild: vi.fn() },
      execCommand: vi.fn().mockReturnValue(true),
    });

    await expect(copyText('QA report')).resolves.toBe('fallback');
    expect(textarea.value).toBe('QA report');
    expect(textarea.remove).toHaveBeenCalledOnce();
  });
});
