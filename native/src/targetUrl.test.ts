import { describe, expect, it } from 'vitest';
import { isValidPort, normalizeTargetUrl } from './targetUrl';

describe('target URL input', () => {
  it('defaults staging links to HTTPS without rewriting their path or query', () => {
    expect(normalizeTargetUrl(' stage.example.com/cart?next=%2Fcheckout&x=1#step '))
      .toBe('https://stage.example.com/cart?next=%2Fcheckout&x=1#step');
    expect(normalizeTargetUrl('stage.example.com:8443')).toBe('https://stage.example.com:8443');
  });

  it.each(['http://stage.example.com', 'HTTPS://stage.example.com/A%2fb?q=한글', 'https://localhost:8080'])
    ('preserves the explicit protocol and full URL: %s', (url) => {
      expect(normalizeTargetUrl(url)).toBe(url);
    });

  it.each(['[::]', '[::1]', '[2001:db8::1]', '[1:2:3:4:5:6:7:8]', '[::ffff:192.168.0.1]', '[1:2:3:4:5:6:192.168.0.1]'])
    ('accepts complete and compressed IPv6 addresses: %s', (host) => {
      expect(normalizeTargetUrl(`http://${host}:8080/path`)).toBe(`http://${host}:8080/path`);
    });

  it.each(['[:::]', '[1::2::3]', '[1:2:3]', '[12345::1]', '[1:2:3:4:5:6:7:8:9]', '[1:2:3:4:5:6:7::8]', '[127.0.0.1]', '[::ffff:999.1.1.1]', '[::ffff:01.2.3.4]'])
    ('rejects malformed IPv6 before replacing the current page: %s', (host) => {
      expect(() => normalizeTargetUrl(`https://${host}`)).toThrow('valid IPv6');
    });

  it.each(['localhost:8080', '10.0.2.2:8080', '192.168.0.20:3000/path', '172.16.1.2', '127.0.0.1', 'mac.local:8080', '[::1]:8080'])
    ('keeps local development convenient with HTTP: %s', (url) => {
      expect(normalizeTargetUrl(url)).toBe(`http://${url}`);
    });

  it.each(['', '   ', 'javascript:alert(1)', 'file:///tmp/test', 'ftp://example.com', 'https://', 'https:///path', 'http:8080', 'https:/example.com', 'https://a b.com', 'https://a\\b.com', 'example.com:0', 'localhost:65536', 'http://localhost:abc', 'https://999.999.1.1', 'https://.example.com', 'https://a..com'])
    ('rejects invalid input before changing the WebView: %s', (url) => {
      expect(() => normalizeTargetUrl(url)).toThrow();
    });
});

describe('local target ports', () => {
  it.each(['1', '8080', '65535'])('accepts %s', (port) => expect(isValidPort(port)).toBe(true));
  it.each(['', '0', '-1', '1.5', '65536', 'NaN', 'Infinity', '8e3', ' 8080 '])
    ('rejects %s', (port) => expect(isValidPort(port)).toBe(false));
});
