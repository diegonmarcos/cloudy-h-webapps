import type { KitState } from '../shell/types';
/** kitStateColor: ok / warn / bad from color.state.*, BUSY = accent, IDLE = text_secondary. */
export const stateColor = (s: KitState) =>
  s === 'ok' ? 'var(--color-state-ok)' : s === 'warn' ? 'var(--color-state-warn)' : s === 'bad' ? 'var(--color-state-bad)' : s === 'busy' ? 'var(--role-accent)' : 'var(--role-text-secondary)';
