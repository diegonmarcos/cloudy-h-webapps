#!/usr/bin/env node
// gen-tokens.mjs — the web design tokens, GENERATED from the Android sources (#1320 C.1). Never hand-copy a value.
//
//   node scripts/gen-tokens.mjs                    # source: cloudy-u-android main via `gh api`
//   node scripts/gen-tokens.mjs --android <dir>    # source: a local checkout
//   node scripts/gen-tokens.mjs --check            # exit 1 when packages/cloudy-ui/tokens/* differ from a fresh render
//
// Writes packages/cloudy-ui/tokens/{tokens.json,tokens.css,tokens.ts}. Every token carries `src`, the file (and the
// name inside it) it was read from, so a reviewer re-checks the source instead of trusting the number.
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { need, readRaw, emit, CHECK } from './lib/android-src.mjs';
import { cssColor, cssAngle } from './lib/color.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SA = 'aa_cloud-superapp';
const RES = `${SA}/app/src/main/res`;
const NAV = 'ab_cloud-libs-shared/libs/bottomnav/src/commonMain/kotlin/com/diegonmarcos/superapp/bottomnav';
const NAV_RES = 'ab_cloud-libs-shared/libs/bottomnav/src/main/res/values';
const KIT = 'ab_cloud-libs-shared/libs/ui-kit/src/commonMain/kotlin/com/diegonmarcos/superapp/uikit';
const WEB_THEME = 'ab_cloud-libs-shared/web/fleet-ui/src/wasmJsMain/kotlin/com/diegonmarcos/fleet/web/FleetWebTheme.kt';
const ICONS_JSON = '1_cicd/src/data/launcher-icons.json';

const T = {}; // flat: "group.name" -> { type, value, src }
const put = (key, type, value, src) => {
  if (T[key]) throw new Error(`duplicate token ${key}`);
  T[key] = { type, value, src };
};
const fail = (m) => { throw new Error(m); };

// ── colours ─────────────────────────────────────────────────────────────────────────────────────
const kColor = (s) => cssColor('#' + /0x([0-9A-Fa-f]{8})/.exec(s)[1]);

function xmlValues(rel, tag) {
  const xml = need(rel).replace(/<!--[\s\S]*?-->/g, '');
  const m = new Map();
  for (const r of xml.matchAll(new RegExp(`<${tag} name="([^"]+)"[^>]*>([^<]*)</${tag}>`, 'g'))) m.set(r[1], r[2].trim());
  return m;
}
const saColors = xmlValues(`${RES}/values/colors.xml`, 'color');
const navColors = xmlValues(`${NAV_RES}/colors.xml`, 'color');
function colorRef(ref, where) {
  const name = ref.replace(/^@color\//, '');
  const v = saColors.get(name) ?? navColors.get(name);
  if (!v) fail(`colour ${ref} (${where}) not in colors.xml`);
  return v.startsWith('@color/') ? colorRef(v, where) : v;
}
const colorSrc = (name) => (saColors.has(name) ? `${RES}/values/colors.xml#${name}` : `${NAV_RES}/colors.xml#${name}`);

// ── drawables: shape -> {radius, gradient, solid, stroke} ──────────────────────────────────────────
function drawable(name) {
  const rel = `${RES}/drawable/${name}.xml`;
  const xml = need(rel).replace(/<!--[\s\S]*?-->/g, '');
  const a = (tag, attr) => (new RegExp(`<${tag}\\b[^>]*android:${attr}="([^"]*)"`).exec(xml) ?? [])[1];
  const col = (v) => (v == null ? null : v.startsWith('@color/') ? cssColor(colorRef(v, rel)) : v.startsWith('@android') ? 'transparent' : cssColor(v));
  const out = { rel };
  const radius = a('corners', 'radius');
  if (radius) out.radius = parseFloat(radius);
  if (/<gradient\b/.test(xml)) {
    const stops = ['startColor', 'centerColor', 'endColor'].map((k) => col(a('gradient', k))).filter(Boolean);
    out.gradient = `linear-gradient(${cssAngle(a('gradient', 'angle') ?? 0)}deg, ${stops.join(', ')})`;
  }
  const solid = a('solid', 'color');
  if (solid) out.solid = col(solid);
  const sw = a('stroke', 'width');
  if (sw) out.stroke = { width: parseFloat(sw), color: col(a('stroke', 'color')) };
  return out;
}

// 1. launcher theme palettes: build.json ui.launcher_themes[].palette (role -> colors.xml name or drawable)
const build = JSON.parse(need(`${SA}/build.json`));
const themes = build.ui?.launcher_themes ?? fail('build.json ui.launcher_themes missing');
const ROLES = ['window', 'surface', 'surface_selected', 'text_primary', 'text_secondary', 'accent', 'hairline', 'tile_ink'];
const themeIds = [];
for (const th of themes) {
  const pal = th.palette ?? fail(`theme ${th.id} has no palette`);
  themeIds.push(th.id);
  for (const role of ROLES) {
    const ref = pal[role] ?? fail(`theme ${th.id} lacks role ${role}`);
    const key = `color.theme.${th.id}.${role}`;
    if (saColors.has(ref) || navColors.has(ref)) { put(key, 'color', cssColor(colorRef(ref, key)), colorSrc(ref)); continue; }
    const d = drawable(ref);
    put(key, 'gradient', d.gradient ?? d.solid ?? fail(`window drawable ${ref} has no colour`), d.rel);
  }
  put(`theme.${th.id}.label`, 'string', th.label, `${SA}/build.json#ui.launcher_themes[${th.id}].label`);
  for (const [f, v] of Object.entries(th.features ?? {})) put(`theme.${th.id}.feature.${f}`, typeof v === 'boolean' ? 'boolean' : 'string', v, `${SA}/build.json#ui.launcher_themes[${th.id}].features.${f}`);
}
put('theme.default', 'string', (themes.find((t) => t.default) ?? themes[0]).id, `${SA}/build.json#ui.launcher_themes[].default`);

// 2. Material 3 scheme of Theme.Superapp (themes.xml items -> colors.xml)
{
  const rel = `${RES}/values/themes.xml`;
  const xml = need(rel).replace(/<!--[\s\S]*?-->/g, '');
  const style = /<style name="Theme\.Superapp"[^>]*>([\s\S]*?)<\/style>/.exec(xml)?.[1] ?? fail('Theme.Superapp not in themes.xml');
  for (const m of style.matchAll(/<item name="(?:android:)?(color[A-Za-z]+)">([^<]+)<\/item>/g)) {
    const [, item, v] = m;
    const value = v.startsWith('@color/') ? cssColor(colorRef(v, rel)) : v.startsWith('#') ? cssColor(v) : null;
    if (value) put(`color.m3.${item.replace(/^color/, '').replace(/^./, (c) => c.toLowerCase())}`, 'color', value, `${rel}#Theme.Superapp/${item}`);
  }
}
// 3. chrome colours the shell paints (colors.xml, by name)
for (const n of ['glass_bg', 'glass_border', 'island_accent', 'drawer_banner_app', 'drawer_banner_user', 'drawer_banner_text', 'drawer_avatar', 'drawer_separator', 'control_blocked', 'glass_orb_fill', 'glass_orb_stroke', 'glass_orb_ripple']) {
  put(`color.chrome.${n}`, 'color', cssColor(colorRef(n, n)), colorSrc(n));
}
for (const n of [...saColors.keys()].filter((k) => /^tile_[a-z]+_(bg|fg)$/.test(k))) put(`color.tile.${n.replace(/^tile_/, '')}`, 'color', cssColor(saColors.get(n)), colorSrc(n));
// 4. state colours: KitPalette defaults (CloudKit.kt) — must equal colors.xml cloud_state_*
{
  const rel = `${KIT}/CloudKit.kt`;
  const src = need(rel);
  for (const s of ['ok', 'warn', 'bad']) {
    const m = new RegExp(`val DEFAULT_${s.toUpperCase()}: Color = (Color\\(0x[0-9A-Fa-f]{8}\\))`).exec(src) ?? fail(`KitPalette.DEFAULT_${s.toUpperCase()} not in CloudKit.kt`);
    const v = kColor(m[1]);
    if (saColors.has(`cloud_state_${s}`) && cssColor(saColors.get(`cloud_state_${s}`)) !== v) fail(`KitPalette DEFAULT_${s} != colors.xml cloud_state_${s}`);
    put(`color.state.${s}`, 'color', v, `${rel}#KitPalette.DEFAULT_${s.toUpperCase()}`);
  }
}
// 5. the Wasm pages' background (FleetWebTheme.kt)
put('color.web.background', 'color', kColor(/val FleetWebBackground = (Color\(0x[0-9A-Fa-f]{8}\))/.exec(need(WEB_THEME))?.[1] ?? fail('FleetWebBackground')), `${WEB_THEME}#FleetWebBackground`);
// 6. category gradients (launcher-icons.json)
{
  const cats = JSON.parse(need(ICONS_JSON)).categories ?? fail('launcher-icons.json categories');
  for (const [id, c] of Object.entries(cats)) {
    put(`color.category.${id}.start`, 'color', cssColor(c.start), `${ICONS_JSON}#categories.${id}.start`);
    put(`color.category.${id}.end`, 'color', cssColor(c.end), `${ICONS_JSON}#categories.${id}.end`);
    put(`category.${id}.tile_group`, 'string', c.tile_group, `${ICONS_JSON}#categories.${id}.tile_group`);
  }
}

// ── nav: NavTokens.kt data-class defaults + NavDecl.kt limits ─────────────────────────────────────────
{
  const rel = `${NAV}/NavTokens.kt`;
  const src = need(rel);
  const body = /data class NavTokens\(([\s\S]*?)\n\)\s*\{/.exec(src)?.[1] ?? fail('NavTokens data class not found');
  const vals = {};
  for (const m of body.matchAll(/^\s*val (\w+): (Dp|TextUnit|Color|Float|Int) = ([^,\n]+),?\s*$/gm)) {
    const [, name, type, raw] = m;
    let value, ttype;
    const r = raw.trim();
    if (/^\d+(\.\d+)?\.dp$/.test(r)) { value = parseFloat(r); ttype = 'dimension'; }
    else if (/^\d+(\.\d+)?\.sp$/.test(r)) { value = parseFloat(r); ttype = 'fontSize'; }
    else if (/^Color\(0x/.test(r)) { value = kColor(r); ttype = 'color'; }
    else if (/^\d+(\.\d+)?f$/.test(r)) { value = parseFloat(r); ttype = 'number'; }
    else if (/^\d+$/.test(r)) { value = parseInt(r, 10); ttype = name.endsWith('Ms') ? 'duration' : 'number'; }
    else if (/^\w+$/.test(r) && vals[r]) { value = vals[r].value; ttype = vals[r].type; } // alias (endInset = pillInset)
    else fail(`NavTokens.${name}: cannot read default ${r}`);
    vals[name] = { value, type: ttype };
    put(`nav.${name}`, ttype, value, `${rel}#NavTokens.${name}`);
  }
  if (Object.keys(vals).length < 40) fail(`NavTokens: only ${Object.keys(vals).length} fields read`);
  const decl = need(`${NAV}/NavDecl.kt`);
  for (const k of ['MAX_BOTTOM', 'MIN_BOTTOM', 'EQUAL_CELLS_BOTTOM']) {
    const m = new RegExp(`const val ${k}: Int = (\\d+)`).exec(decl) ?? fail(`NavDecl.${k}`);
    put(`nav.limits.${k}`, 'number', Number(m[1]), `${NAV}/NavDecl.kt#${k}`);
  }
  // the Android resources must agree with the defaults (FleetParityTest pins the same on Android)
  const dimens = xmlValues(`${NAV_RES}/dimens.xml`, 'dimen');
  const pairs = { pillInset: 'bottom_nav_pill_inset', iconSize: 'bottom_nav_icon_size', labelTextSize: 'bottom_nav_label_text_size', tabsPillRadius: 'page_tabs_pill_radius', islandBottomMargin: 'bottom_nav_island_bottom_margin' };
  for (const [k, d] of Object.entries(pairs)) if (dimens.has(d) && parseFloat(dimens.get(d)) !== vals[k].value) fail(`NavTokens.${k} != dimens ${d}`);
}

// ── density: KitDensity (KitComponents.kt) ─────────────────────────────────────────────────────────
{
  const rel = `${KIT}/KitComponents.kt`;
  const src = need(rel);
  const body = /object KitDensity \{([\s\S]*?)\n\}/.exec(src)?.[1] ?? fail('object KitDensity not found');
  const scale = parseFloat(/const val TEXT_SCALE: Float = ([\d.]+)f/.exec(body)?.[1] ?? fail('KitDensity.TEXT_SCALE'));
  put('density.textScale', 'number', scale, `${rel}#KitDensity.TEXT_SCALE`);
  for (const m of body.matchAll(/^\s*val (\w+): (Dp|TextUnit) = (.+)$/gm)) {
    const [, name, , raw] = m;
    let v, t;
    if (/^[\d.]+\.dp$/.test(raw)) { v = parseFloat(raw); t = 'dimension'; }
    else if (/^\(([\d.]+)f \* TEXT_SCALE\)\.sp$/.test(raw)) { v = Math.round(parseFloat(/^\(([\d.]+)f/.exec(raw)[1]) * scale * 100) / 100; t = 'fontSize'; }
    else if (/^[\d.]+\.em$/.test(raw)) { v = parseFloat(raw); t = 'em'; }
    else if (/^[\d.]+\.sp$/.test(raw)) { v = parseFloat(raw); t = 'fontSize'; }
    else fail(`KitDensity.${name}: cannot read ${raw}`);
    put(`density.${name}`, t, v, `${rel}#KitDensity.${name}`);
  }
  // KitCard: RoundedCornerShape(N.dp) + padding (CloudKit.kt)
  const ck = need(`${KIT}/CloudKit.kt`);
  const card = /clip\(RoundedCornerShape\((\d+)\.dp\)\)\.background\(p\.surface\)\.padding\((\d+)\.dp\)/.exec(ck) ?? fail('KitCard shape not found in CloudKit.kt');
  put('shape.card.radius', 'dimension', Number(card[1]), `${KIT}/CloudKit.kt#KitCard RoundedCornerShape`);
  put('shape.card.padding', 'dimension', Number(card[2]), `${KIT}/CloudKit.kt#KitCard padding`);
}

// ── shell geometry: dimens.xml + the toolbar height the comment pins (?attr/actionBarSize in Theme.Superapp) ──
{
  const rel = `${RES}/values/dimens.xml`;
  const raw = need(rel);
  const d = xmlValues(rel, 'dimen');
  for (const n of ['shell_top_row_margin', 'shell_top_inset']) put(`shell.${n}`, 'dimension', parseFloat(d.get(n) ?? fail(`dimens ${n}`)), `${rel}#${n}`);
  const ab = /(\d+) dp in Theme\.Superapp/.exec(raw)?.[1] ?? fail('actionBarSize note not in dimens.xml');
  if (Number(ab) + parseFloat(d.get('shell_top_row_margin')) !== parseFloat(d.get('shell_top_inset'))) fail('shell_top_inset != shell_top_row_margin + actionBarSize');
  put('shell.action_bar_size', 'dimension', Number(ab), `${rel}#actionBarSize (PageTopInsetTest)`);
}

// ── shapes: the launcher's glass drawables ─────────────────────────────────────────────────────────
for (const n of ['bg_tile_glass', 'bg_liquid_glass', 'bg_liquid_glass_pill', 'bg_icon_glass', 'bg_dynamic_island', 'bg_drawer_glass', 'bg_music_popup', 'bg_gradient_black_purple']) {
  const d = drawable(n);
  const k = `shape.${n.replace(/^bg_/, '')}`;
  if (d.radius != null) put(`${k}.radius`, 'dimension', d.radius, d.rel);
  if (d.gradient) put(`${k}.gradient`, 'gradient', d.gradient, d.rel);
  if (d.solid) put(`${k}.fill`, 'color', d.solid, d.rel);
  if (d.stroke) { put(`${k}.stroke_width`, 'dimension', d.stroke.width, d.rel); put(`${k}.stroke`, 'color', d.stroke.color, d.rel); }
}

// ── type: kitTypography() = Material 3 Typography() roles with lineHeight / letterSpacing unset ───────
{
  const rel = `${KIT}/CloudKit.kt`;
  const src = need(rel);
  const fn = /fun kitTypography\([\s\S]*?\n\)/.exec(src)?.[0] ?? fail('kitTypography() not found');
  if (!/lineHeight = TextUnit\.Unspecified, letterSpacing = TextUnit\.Unspecified/.test(src)) fail('kitTypography dense() changed');
  // androidx.compose.material3 TypeScaleTokens (the Typography() defaults kitTypography copies): size sp / weight
  const M3 = { displayLarge: [57, 400], displayMedium: [45, 400], displaySmall: [36, 400], headlineLarge: [32, 400], headlineMedium: [28, 400], headlineSmall: [24, 400], titleLarge: [22, 400], titleMedium: [16, 500], titleSmall: [14, 500], bodyLarge: [16, 400], bodyMedium: [14, 400], bodySmall: [12, 400], labelLarge: [14, 500], labelMedium: [12, 500], labelSmall: [11, 500] };
  for (const [role, [size, weight]] of Object.entries(M3)) {
    if (!fn.includes(`${role} = base.${role}.dense()`)) fail(`kitTypography no longer densifies ${role}`);
    put(`type.${role}.size`, 'fontSize', size, `${rel}#kitTypography().${role} (M3 TypeScaleTokens)`);
    put(`type.${role}.weight`, 'number', weight, `${rel}#kitTypography().${role} (M3 TypeScaleTokens)`);
  }
  put('type.family.sans', 'string', 'Roboto, system-ui, -apple-system, "Segoe UI", sans-serif', `${rel}#kitTypography (FontFamily.Default = Roboto on Android)`);
  put('type.family.mono', 'string', '"Roboto Mono", ui-monospace, "DejaVu Sans Mono", monospace', `${RES}/values/themes.xml#Theme.Superapp.Terminal (monospace)`);
}

// ── motion ──────────────────────────────────────────────────────────────────────────────────────
for (const n of ['fade_in', 'fade_out', 'slide_in_up', 'slide_out_down']) {
  const rel = `${RES}/anim/${n}.xml`;
  const ms = /android:duration="(\d+)"/.exec(need(rel))?.[1] ?? fail(`${rel} duration`);
  put(`motion.${n}`, 'duration', Number(ms), rel);
}
{
  const rel = `${SA}/app/src/main/java/com/diegonmarcos/superapp/launcher/HomeFanMenu.kt`;
  const src = readRaw(rel);
  const m = src && /enter\.animateTo\(1f, tween\((\d+)/.exec(src);
  if (m) put('motion.fan_enter', 'duration', Number(m[1]), `${rel}#enter tween`);
}

// ── render ──────────────────────────────────────────────────────────────────────────────────────
const HEADER = 'GENERATED by scripts/gen-tokens.mjs from diegonmarcos/cloudy-u-android — DO NOT EDIT. Re-run: node scripts/gen-tokens.mjs';
const keys = Object.keys(T).sort();
const json = JSON.stringify({ _generated: HEADER, count: keys.length, tokens: Object.fromEntries(keys.map((k) => [k, T[k]])) }, null, 2) + '\n';

const cssName = (k) => '--' + k.replace(/[._]/g, '-').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
const cssValue = ({ type, value }) => {
  if (type === 'dimension' || type === 'fontSize') return `${value}px`;
  if (type === 'duration') return `${value}ms`;
  if (type === 'em') return `${value}em`;
  if (type === 'boolean') return value ? '1' : '0';
  return String(value);
};
const lines = keys.filter((k) => T[k].type !== 'string' || k.startsWith('type.family')).map((k) => `  ${cssName(k)}: ${cssValue(T[k])};`);
const themeBlocks = themeIds.map((id) => `[data-theme='${id}'] {\n${ROLES.map((r) => `  --role-${r.replace(/_/g, '-')}: var(${cssName(`color.theme.${id}.${r}`)});`).join('\n')}\n}`);
const css = `/* ${HEADER} */\n:root {\n${lines.join('\n')}\n}\n/* the palette ROLES of the active launcher theme (html[data-theme]) */\n${themeBlocks.join('\n')}\n`;

const nested = {};
for (const k of keys) {
  const parts = k.split('.');
  let o = nested;
  for (const p of parts.slice(0, -1)) o = o[p] ??= {};
  o[parts[parts.length - 1]] = T[k].value;
}
const ts = `// ${HEADER}\n/* eslint-disable */\nexport const tokens = ${JSON.stringify(nested, null, 2)} as const;\nexport type Tokens = typeof tokens;\nexport const THEME_IDS = ${JSON.stringify(themeIds)} as const;\nexport type ThemeId = (typeof THEME_IDS)[number];\nexport const PALETTE_ROLES = ${JSON.stringify(ROLES)} as const;\nexport const TOKEN_COUNT = ${keys.length};\n`;

emit(root, { 'packages/cloudy-ui/tokens/tokens.json': json, 'packages/cloudy-ui/tokens/tokens.css': css, 'packages/cloudy-ui/tokens/tokens.ts': ts }, 'gen-tokens');
console.log(CHECK ? `ok: ${keys.length} tokens current` : `wrote ${keys.length} tokens (${themeIds.length} themes)`);
