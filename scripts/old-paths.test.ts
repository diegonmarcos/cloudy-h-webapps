import { describe, expect, it } from 'vitest';
import { C3_OLD, oldUrlTarget, oldSuperAppTarget } from './lib/old-paths.mjs';
import { PORTAL } from '../packages/c3-data/panels';

describe('old URL map (#1320 M7)', () => {
  it('every re-homed /cloud/ portal page redirects to its /cloudy-c3/portal/<id>/', () => {
    for (const p of PORTAL) expect(C3_OLD[p.old], p.old).toBe(`portal/${p.id}/`);
  });
  it('maps renamed sections to their new home and unknown paths to the nearest ancestor', () => {
    const routes = new Set(['', 'cloud/', 'cloud/apps/', 'boards/', 'cloud-drive/']);
    expect(oldUrlTarget('/cloud-superapp/cloud/apps/', routes)).toBe('/cloud-webapps/cloud/apps/');
    expect(oldSuperAppTarget('drive/trash/', routes)).toBe('cloud-drive/');
    expect(oldSuperAppTarget('infos/work-pm/', routes)).toBe('boards/');
    expect(oldSuperAppTarget('nowhere/at/all/', routes)).toBe('');
    expect(oldUrlTarget('/cloud/products.html', routes)).toBe('/cloudy-c3/portal/products/');
    expect(oldUrlTarget('/cloud-webapps/not-an-app/', routes)).toBeNull();
  });
});
