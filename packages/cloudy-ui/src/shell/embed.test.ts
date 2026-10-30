import { describe, expect, it } from 'vitest';
import vm from 'node:vm';
import { isEmbed, bootScript } from './embed';

const UA = 'Mozilla/5.0 (Linux; Android 16) Chrome/140';
function boot(search: string, ua: string, ls: Record<string, string> = {}) {
  const attrs: Record<string, string> = {}, classes = new Set<string>(), dataset: Record<string, string> = {};
  const store = (m: Record<string, string>) => ({ getItem: (k: string) => m[k] ?? null, setItem: (k: string, v: string) => { m[k] = v; } });
  vm.runInNewContext(bootScript(['cloud', 'cloud_minimalist_black'], 'cloud'), {
    document: { documentElement: { classList: { add: (c: string) => classes.add(c) }, setAttribute: (k: string, v: string) => { attrs[k] = v; }, dataset } },
    location: { search }, navigator: { userAgent: ua }, sessionStorage: store({}), localStorage: store(ls), URLSearchParams, innerWidth: 412, innerHeight: 915,
  });
  return { attrs, classes, dataset };
}
describe('embed contract', () => {
  it('?embed=1, among other params, or the UA marker embeds; embed=10 does not', () => {
    expect(isEmbed('?embed=1', UA, null)).toBe(true);
    expect(isEmbed('?a=1&embed=1&b=2', UA, null)).toBe(true);
    expect(isEmbed('', UA + ' CloudSuperApp-Embed/1', null)).toBe(true);
    expect(isEmbed('?embed=10', UA, null)).toBe(false);
    expect(isEmbed('', UA, '1')).toBe(true);
  });
  it('the boot script marks <html> before paint', () => {
    expect(boot('?embed=1', UA).classes.has('embed')).toBe(true);
    expect(boot('', UA).classes.has('embed')).toBe(false);
  });
  it('?theme= overrides and persists; an unknown theme falls back to the default', () => {
    expect(boot('?theme=cloud_minimalist_black', UA).attrs['data-theme']).toBe('cloud_minimalist_black');
    expect(boot('?theme=nope', UA).attrs['data-theme']).toBe('cloud');
    expect(boot('', UA, { 'cloudy:theme': 'cloud_minimalist_black' }).attrs['data-theme']).toBe('cloud_minimalist_black');
  });
  it('sets the window class on <html>', () => expect(boot('', UA).dataset.layout).toBe('compact'));
});
