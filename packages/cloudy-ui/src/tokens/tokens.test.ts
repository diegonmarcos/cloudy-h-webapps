import { describe, expect, it } from 'vitest';
import data from '../../tokens/tokens.json';
import { tokens, THEME_IDS, PALETTE_ROLES, TOKEN_COUNT } from '../../tokens/tokens';

// The numbers below are the Android literals the plan cites (#1320 C.1), restated ON PURPOSE: the generator reads them
// from source; this test fails when the source and the cited contract part ways (then re-check the plan, not the test).
type Entry = { type: string; value: unknown; src: string };
const T = (data as { tokens: Record<string, Entry> }).tokens;

describe('tokens.json', () => {
  it('lists at least 120 tokens, each with a source', () => {
    expect(TOKEN_COUNT).toBeGreaterThanOrEqual(120);
    for (const [k, e] of Object.entries(T)) expect(e.src, k).toMatch(/\S/);
  });
  it('every launcher theme has every palette role', () => {
    expect(THEME_IDS).toContain('cloud');
    expect(THEME_IDS).toContain('cloud_minimalist_black');
    for (const id of THEME_IDS) for (const r of PALETTE_ROLES) expect(T[`color.theme.${id}.${r}`], `${id}.${r}`).toBeDefined();
  });
  it('cloud palette = colors.xml theme_cloud_* (CSS #rrggbbaa)', () => {
    expect(tokens.color.theme.cloud.accent).toBe('#c7aefb');
    expect(tokens.color.theme.cloud.surface).toBe('#ffffff22');
    expect(tokens.color.theme.cloud.surface_selected).toBe('#7c3aed44');
    expect(tokens.color.theme.cloud.hairline).toBe('#a78bfa33');
    expect(tokens.color.theme.cloud.tile_ink).toBe('#14082b');
    expect(tokens.color.theme.cloud.window).toBe('linear-gradient(180deg, #2d1b69, #000000, #2d1b69)');
    expect(tokens.color.theme.cloud_minimalist_black.accent).toBe('#00ff66');
  });
  it('state colours = KitPalette defaults', () => {
    expect(tokens.color.state).toEqual({ ok: '#7fc98f', warn: '#e2b85c', bad: '#e5737a' });
  });
  it('category gradients = launcher-icons.json', () => {
    expect(tokens.color.category.comms).toEqual({ start: '#db2777', end: '#6d28d9' });
    expect(tokens.color.category.configs).toEqual({ start: '#475569', end: '#1e1b4b' });
  });
  it('nav = NavTokens defaults and NavDecl limits', () => {
    const n = tokens.nav;
    expect([n.pillInset, n.endInset, n.iconSize, n.labelTextSize, n.islandBottomMargin, n.widthFraction, n.collapseMs]).toEqual([6, 6, 24, 12, 12, 0.8, 220]);
    expect([n.minTouchTarget, n.minCellWidth, n.fitMinCell, n.fitIconSize, n.fitLabelTextSize]).toEqual([48, 56, 44, 20, 10]);
    expect([n.tabsPillRadius, n.tabsPillPadH, n.tabsPillPadV, n.tabsTextSize, n.tabsLetterSpacingMilli, n.tabsMinChars]).toEqual([18, 14, 8, 12, 80, 7]);
    expect([n.islandFill, n.pillFill, n.pillInk, n.idleInk]).toEqual(['#140b26', '#e6e0e9', '#322f35', '#cac4d0']);
    expect(n.limits).toEqual({ MAX_BOTTOM: 8, MIN_BOTTOM: 2, EQUAL_CELLS_BOTTOM: 5 });
  });
  it('density = KitDensity', () => {
    const d = tokens.density;
    expect([d.textScale, d.small, d.medium, d.large, d.rule, d.dot, d.glyph, d.avatar, d.touch, d.interactiveFloor, d.buttonHeight])
      .toEqual([0.78, 8, 12, 16, 1, 8, 28, 56, 36, 0, 30]);
  });
  it('shell geometry = dimens.xml', () => {
    expect(tokens.shell).toEqual({ shell_top_row_margin: 26, shell_top_inset: 90, action_bar_size: 64 });
  });
  it('tokens.css declares a custom property per non-string token', async () => {
    const { readFileSync } = await import('node:fs');
    const css = readFileSync(new URL('../../tokens/tokens.css', import.meta.url), 'utf8');
    expect(css).toContain('--nav-pill-inset: 6px;');
    expect(css).toContain("[data-theme='cloud'] {");
    expect(css).toContain('--role-accent: var(--color-theme-cloud-accent);');
  });
});
