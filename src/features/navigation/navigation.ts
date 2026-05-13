export function pushHistoryState(label = 'push') {
  const url = new URL(window.location.href);
  url.searchParams.set('qa-nav', label);
  window.history.pushState({ label, time: Date.now() }, '', url);
  return url.toString();
}

export function replaceHistoryState(label = 'replace') {
  const url = new URL(window.location.href);
  url.searchParams.set('qa-nav', label);
  window.history.replaceState({ label, time: Date.now() }, '', url);
  return url.toString();
}

export function setHashNavigation(label = 'hash') {
  window.location.hash = `qa-${label}-${Date.now()}`;
  return window.location.hash;
}
