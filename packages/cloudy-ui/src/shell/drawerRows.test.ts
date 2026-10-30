import { describe, expect, it } from 'vitest';
import { drawerRows } from './drawerRows';
import nav from '../../nav/nav.json';

describe('drawer rows (HomeDrawerFragment.rows)', () => {
  const rows = drawerRows(nav.superapp as never);
  it('starts with the main menu, then the Home group with the bottom-nav sections', () => {
    expect(rows[0]).toMatchObject({ kind: 'item', label: 'Home Apps' });
    const home = rows.findIndex((r) => r.kind === 'title' && r.label === 'Home');
    expect(home).toBeGreaterThan(0);
    expect(rows[home + 1]).toMatchObject({ kind: 'item', target: 'section:communication' });
  });
  it('expands a section tile into its pages', () => {
    expect(rows.some((r) => r.target === 'page:cloud/apps' && r.label.includes('└───'))).toBe(true);
  });
});
