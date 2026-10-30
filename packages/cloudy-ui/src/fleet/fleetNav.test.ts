import { describe, expect, it } from 'vitest';
import { titleHierarchy, titleNav, fitCrumbs, railLabel, cellWidth } from './fleetNav';

const calc = { id: 'calculator', label: 'Calc', pages: [{ id: 'calc', label: 'Calc' }, { id: 'convert', label: 'Convert' }, { id: 'graph', label: 'Graph', pages: [{ id: 'g2', label: 'Plot' }] }] };
const sections = [calc, { id: 'sheet', label: 'Sheet' }];

describe('fleet nav (ui-nav-bars ports)', () => {
  it('titleHierarchy marks the path to the page shown', () => {
    const h = titleHierarchy(calc, 'g2');
    expect(h.map((e) => [e.id, e.depth, e.selected])).toEqual([['calculator', 0, false], ['calc', 1, false], ['convert', 1, false], ['graph', 1, true], ['g2', 2, true]]);
  });
  it('titleNav: App / Section / Page crumbs, siblings then children', () => {
    const n = titleNav('Cloud Calc', 'Calc', titleHierarchy(calc, 'graph'), sections);
    expect(n.crumbs.map((c) => c.label)).toEqual(['Cloud Calc', 'Calc', 'Graph']);
    expect(n.related.map((e) => e.id)).toEqual(['calc', 'convert', 'graph', 'g2']);
  });
  it('a section crumb lists the sections as siblings', () => {
    const n = titleNav('Cloud Calc', 'Calc', titleHierarchy(calc, null), sections);
    expect(n.related.map((e) => e.id)).toEqual(['calculator', 'sheet', 'calc', 'convert', 'graph']);
  });
  it('fitCrumbs drops leading segments for an ellipsis', () => {
    expect(fitCrumbs(['A', 'Bb', 'Ccc'], (l) => l.length <= 9)).toBe('… / Ccc');
    expect(fitCrumbs(['Cloud', 'Mail', 'Inbox'], () => true)).toBe('Cloud / Mail / Inbox');
  });
  it('railLabel and the bar cell', () => {
    expect(railLabel('Containers')).toBe('Con');
    expect(cellWidth(380, 5)).toBe(56);
    expect(cellWidth(360, 8)).toBe(43);
  });
});
