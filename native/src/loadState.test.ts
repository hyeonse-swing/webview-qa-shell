import { describe, expect, it } from 'vitest';
import { reduceLoadState, type LoadState } from './loadState';

const initial: LoadState = { phase: 'idle', url: 'https://stage.example.com' };

describe('WebView load state', () => {
  it('keeps a network failure through load end and navigation callbacks until a new load starts', () => {
    const loading = reduceLoadState(initial, { type: 'start', url: initial.url });
    const failed = reduceLoadState(loading, {
      type: 'error', url: initial.url, message: 'Error: Network connection lost',
    });
    expect(reduceLoadState(failed, { type: 'end', url: initial.url })).toEqual(failed);
    expect(reduceLoadState(failed, {
      type: 'navigation', url: initial.url, loading: false,
    })).toEqual(failed);
    expect(reduceLoadState(failed, { type: 'start', url: initial.url })).toMatchObject(loading);
  });

  it('keeps an HTTP failure through later success callbacks', () => {
    const failed = reduceLoadState(initial, {
      type: 'error', url: initial.url, message: 'HTTP 503: https://stage.example.com',
    });
    expect(reduceLoadState(failed, { type: 'end', url: initial.url })).toEqual(failed);
    expect(reduceLoadState(failed, {
      type: 'navigation', url: initial.url, loading: false,
    })).toEqual(failed);
  });

  it('records subresource failures only as diagnostics', () => {
    const loaded: LoadState = { phase: 'loaded', url: initial.url };
    expect(reduceLoadState(loaded, { type: 'subresourceError' })).toEqual(loaded);
  });

  it('ignores terminal callbacks from the prior page after a new main-frame start', () => {
    const nextUrl = 'https://stage.example.com/next';
    const loading = reduceLoadState(initial, { type: 'start', url: nextUrl });
    expect(reduceLoadState(loading, { type: 'end', url: initial.url })).toEqual(loading);
    expect(reduceLoadState(loading, {
      type: 'error', url: initial.url, message: 'Old page failed',
    })).toEqual(loading);
    expect(reduceLoadState(loading, {
      type: 'navigation', url: initial.url, loading: false,
    })).toEqual(loading);
  });
});
