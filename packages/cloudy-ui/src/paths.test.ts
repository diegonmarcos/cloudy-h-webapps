import { describe, expect, it } from 'vitest';
import { joinBase } from './paths';

describe('joinBase', () => {
  it('home is the base with a trailing slash', () => expect(joinBase('/cloud-webapps', '')).toBe('/cloud-webapps/'));
  it('one slash between, trailing slash always', () => expect(joinBase('/cloud-webapps/', '/cloud-calc/calculator')).toBe('/cloud-webapps/cloud-calc/calculator/'));
  it('empty base (dev) stays root-relative', () => expect(joinBase('', 'cloud')).toBe('/cloud/'));
});
