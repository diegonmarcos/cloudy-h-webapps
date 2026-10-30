import { describe, expect, it } from 'vitest';
import { resolveTarget, targetFromLocation } from './targets';
import targetsJson from '../../nav/targets.json';

const T = targetsJson.targets as Record<string, string>;
describe('target grammar -> web path', () => {
  it('section, page, home', () => {
    expect(resolveTarget('section:home', T)).toEqual({ kind: 'path', path: '' });
    expect(resolveTarget('section:cloud', T)).toEqual({ kind: 'path', path: 'cloud/' });
    expect(resolveTarget('page:cloud/apps', T)).toEqual({ kind: 'path', path: 'cloud/apps/' });
  });
  it('extapp with and without a page', () => {
    expect(resolveTarget('extapp:cloud-calc', T)).toEqual({ kind: 'path', path: 'cloud-calc/' });
    expect(resolveTarget('extapp:cloud-calc#page:calculator/graph', T)).toEqual({ kind: 'path', path: 'cloud-calc/calculator/graph/' });
    expect(resolveTarget('extapp:cloud-calc#page:calculator/nope', T)).toEqual({ kind: 'path', path: 'cloud-calc/' });
  });
  it('URLs pass through; device-only targets resolve to nothing', () => {
    expect(resolveTarget('https://linktree.diegonmarcos.com', T)).toEqual({ kind: 'url', url: 'https://linktree.diegonmarcos.com' });
    expect(resolveTarget('action:open_search', T).kind).toBe('none');
    expect(resolveTarget('app://com.diegonmarcos.cloudcalc', T, { 'com.diegonmarcos.cloudcalc': 'cloud-calc' })).toEqual({ kind: 'path', path: 'cloud-calc/' });
  });
  it('/t/ decodes the path, the fragment and the query form', () => {
    expect(targetFromLocation('/cloud-webapps/t/page:cloud/apps', '', '', '/cloud-webapps')).toBe('page:cloud/apps');
    expect(targetFromLocation('/cloud-webapps/t/extapp:cloud-me', '', '#page:health/home', '/cloud-webapps')).toBe('extapp:cloud-me#page:health/home');
    expect(targetFromLocation('/cloud-webapps/t/', '?extapp%3Acloud-calc', '', '/cloud-webapps')).toBe('extapp:cloud-calc');
  });
});
