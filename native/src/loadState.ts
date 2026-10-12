export type LoadState =
  | { phase: 'idle'; url: string; previousUrl?: string }
  | { phase: 'loading'; url: string; previousUrl?: string }
  | { phase: 'loaded'; url: string; previousUrl?: string }
  | { phase: 'error'; url: string; message: string; previousUrl?: string };

export type LoadEvent =
  | { type: 'start'; url: string }
  | { type: 'end'; url: string }
  | { type: 'navigation'; url: string; loading: boolean }
  | { type: 'error'; url: string; message: string }
  | { type: 'subresourceError' };

export function reduceLoadState(state: LoadState, event: LoadEvent): LoadState {
  if (event.type === 'start') return {
    phase: 'loading', url: event.url,
    previousUrl: event.url === state.url ? state.previousUrl : state.url,
  };
  if (event.type === 'subresourceError') return state;

  // A previous page can still emit its terminal callback after a newer page
  // has started. Redirect URLs remain eligible when they are not the old page.
  if (event.url !== state.url && event.url === state.previousUrl) return state;
  if (event.type === 'error') return {
    phase: 'error', url: event.url, message: event.message, previousUrl: state.previousUrl,
  };

  // WebView emits load end and navigation updates after a failed load.
  // Only a new main-frame start may clear that failure.
  if (state.phase === 'error') return state;
  if (event.type === 'end') return {
    phase: 'loaded', url: event.url, previousUrl: state.previousUrl,
  };
  return {
    phase: event.loading ? 'loading' : 'loaded', url: event.url,
    previousUrl: event.url === state.url ? state.previousUrl : state.url,
  };
}
