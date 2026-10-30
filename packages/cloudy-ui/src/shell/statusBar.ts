// The home status bar, RENDERED FROM the SuperApp's declaration (aa_cloud-superapp/build.json::home_status_bar, generated into
// nav/status-bar.json, #1332): which elements sit in which cluster, in which order, visible or not. The replica adds only the
// mock STATE (on/off, dots, values) the real bar reads from the phone.
export type StatusElement = { id: string; label: string; short: string; kind: string; position: 'left' | 'centre' | 'right'; order: number; visible: boolean };
export type StatusBarDecl = { row_height_dp: number; elements: StatusElement[] };
export type ChipMock = { on: boolean; dots: number };

const inCluster = (d: StatusBarDecl, pos: StatusElement['position']) =>
  d.elements.filter((e) => e.position === pos && e.visible).sort((a, b) => a.order - b.order);

/** The left cluster: the visible network elements in declared order, each with its mock state (unknown ids read as off). */
export function stripChips(d: StatusBarDecl, mock: Record<string, ChipMock>): { label: string; on: boolean; dots: number }[] {
  return inCluster(d, 'left').filter((e) => e.kind === 'network').map((e) => ({ label: e.short, ...(mock[e.id] ?? { on: false, dots: -1 }) }));
}

/** The right cluster's metric captions ("R 62%") in declared order, from the mock values by element id. */
export function stripRight(d: StatusBarDecl, values: Record<string, string>): string[] {
  return inCluster(d, 'right').filter((e) => e.kind === 'metric' && values[e.id] != null).map((e) => `${e.short} ${values[e.id]}`);
}

/** Whether the battery icon is drawn (the declared battery element is visible). */
export const stripShowsBattery = (d: StatusBarDecl): boolean => inCluster(d, 'right').some((e) => e.kind === 'battery');
