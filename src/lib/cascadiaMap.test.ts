import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

describe('Cascadia reference map deployment', () => {
  it('permits same-origin frames while keeping scripts restricted', () => {
    const config = JSON.parse(read('vercel.json'));
    const csp = config.headers.find((entry: { source: string }) => entry.source === '/(.*)').headers
      .find((header: { key: string }) => header.key === 'Content-Security-Policy').value;
    expect(csp.split(';').map((directive: string) => directive.trim())).toContain("frame-src 'self'");
    expect(csp.split(';').map((directive: string) => directive.trim())).toContain("script-src 'self'");
  });

  it('loads a valid external script after the map containers without inline handlers', () => {
    const html = read('public/references/cascadia-hub-map.html');
    const scriptTag = '<script src="/references/cascadia-hub-map.js"></script>';
    expect(html).toContain(scriptTag);
    expect(html.indexOf(scriptTag)).toBeGreaterThan(html.indexOf('id="rows"'));
    expect(html).not.toMatch(/<script\s*>/i);
    expect(html).not.toMatch(/\son\w+\s*=/i);
    expect(() => new Script(read('public/references/cascadia-hub-map.js'))).not.toThrow();
  });

  it('preserves the frame origin for CSP self script loading', () => {
    const page = read('src/pages/CascadiaMap.tsx');
    const sandbox = page.match(/sandbox="([^"]+)"/)?.[1].split(' ');
    expect(sandbox).toContain('allow-same-origin');
    expect(sandbox).toContain('allow-scripts');
    expect(sandbox).not.toContain('allow-top-navigation');
  });
});
