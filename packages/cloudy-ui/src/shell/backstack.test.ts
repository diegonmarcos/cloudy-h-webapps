import { describe, expect, it } from 'vitest';
import { backTarget } from './backstack';

const sections = [
  { id: 'cloud', pages: [{ id: 'apps' }, { id: 'webapps' }, { id: 'lnktree' }, { id: 'configs' }] },
  { id: 'feed', pages: [{ id: 'hidden', hidden: true }, { id: 'all' }, { id: 'unread' }] },
];
describe('back stack', () => {
  it('a page goes back to its section first tab', () => expect(backTarget('cloud/lnktree/', sections)).toBe('cloud/apps/'));
  it('the first tab goes back Home', () => expect(backTarget('cloud/apps/', sections)).toBe(''));
  it('a section goes back Home', () => expect(backTarget('cloud/', sections)).toBe(''));
  it('Home has nothing to go back to', () => expect(backTarget('', sections)).toBeNull());
  it('a nested page goes back to its parent page', () => expect(backTarget('cloud/configs/about/', sections)).toBe('cloud/configs/'));
  it('hidden pages are skipped when finding the first tab', () => expect(backTarget('feed/unread/', sections)).toBe('feed/all/'));
});
