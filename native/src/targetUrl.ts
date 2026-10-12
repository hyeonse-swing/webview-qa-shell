const HTTP_SCHEME = /^https?:\/\//i;
const HOST_WITH_PORT = /^[^/?#]+:\d+(?:[/?#]|$)/;

/** Keep the supplied path/query intact, including encoded values used by staging links. */
export function normalizeTargetUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error('Enter a URL to load.');
  if (/[\s\\]/.test(trimmed)) throw new Error('Remove spaces or backslashes from the URL.');

  let target = trimmed;
  if (!HTTP_SCHEME.test(target)) {
    if (/^https?:/i.test(target) || (/^[a-z][a-z\d+.-]*:/i.test(target) && !HOST_WITH_PORT.test(target))) {
      throw new Error('Use an http:// or https:// URL.');
    }
    const localHost = /^(?:localhost|[\w.-]+\.localhost|[\w.-]+\.local|127(?:\.\d{1,3}){3}|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}|\[::1\])(?::\d+)?(?:[/?#]|$)/i;
    target = `${localHost.test(target) ? 'http' : 'https'}://${target}`;
  }

  // React Native's URL implementation does not validate malformed input consistently.
  const authority = target.match(/^https?:\/\/([^/?#]+)/i)?.[1];
  const hostPort = authority?.slice(authority.lastIndexOf('@') + 1);
  const parts = hostPort?.match(/^(\[[\da-f:.]+\]|[^:[\]]+)(?::(\d+))?$/i);
  if (!parts) throw new Error('Enter a valid hostname and optional port.');

  const [, host, port] = parts;
  if (host.startsWith('[') && !isValidIpv6(host.slice(1, -1))) {
    throw new Error('Enter a valid IPv6 address.');
  }
  if (!host.startsWith('[') && (!/^[\p{L}\p{N}\p{M}._-]+$/u.test(host) || host.startsWith('.') || host.includes('..'))) {
    throw new Error('Enter a valid hostname.');
  }
  if (/^\d+(?:\.\d+){3}$/.test(host) && host.split('.').some((part) => Number(part) > 255)) {
    throw new Error('Enter a valid IP address.');
  }
  if (port !== undefined && !isValidPort(port)) {
    throw new Error('Use a port between 1 and 65535.');
  }

  return target;
}

export function isValidPort(value: string): boolean {
  return /^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 65535;
}

function isValidIpv6(address: string): boolean {
  // An embedded IPv4 tail occupies the final two IPv6 groups.
  if (address.includes('.')) {
    const boundary = address.lastIndexOf(':');
    const octets = address.slice(boundary + 1).split('.');
    if (boundary < 0 || octets.length !== 4 || octets.some((octet) =>
      !/^(0|[1-9]\d{0,2})$/.test(octet) || Number(octet) > 255,
    )) return false;
    address = `${address.slice(0, boundary + 1)}0:0`;
  }

  const halves = address.split('::');
  if (halves.length > 2) return false;
  const groups = halves.flatMap((half) => half === '' ? [] : half.split(':'));
  if (!groups.every((group) => /^[\da-f]{1,4}$/i.test(group))) return false;
  return halves.length === 2 ? groups.length < 8 : groups.length === 8;
}
