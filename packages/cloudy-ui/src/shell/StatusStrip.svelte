<script lang="ts">
  // LauncherStatusStrip (launcher/LauncherStatusStrip.kt): LEFT network chips (NetworkSections.ORDER) | CENTRE clock
  // "dd-MM-yyyy HH:mm EEE" | RIGHT RAM . Storage . CPU . battery, monospace bold, then a 0.75dp #33FFFFFF hairline.
  // A browser cannot read the radios, so the chips are the replica's static mock (shell.json statusBar); the clock is live.
  import { onMount } from 'svelte';
  type Chip = { label: string; on: boolean; dots: number };
  let { chips = [], right = [], battery = 84 }: { chips?: Chip[]; right?: string[]; battery?: number } = $props();
  const fmt = (d: Date) => {
    const p = (n: number) => String(n).padStart(2, '0');
    return `${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())} ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]}`;
  };
  let clock = $state('');
  onMount(() => {
    clock = fmt(new Date());
    const t = setInterval(() => (clock = fmt(new Date())), 15_000);
    return () => clearInterval(t);
  });
</script>

<div class="status-strip" data-testid="strip">
  <div class="row">
    <div class="left">
      {#each chips as c (c.label)}
        <div class="chip" style:--ink={c.on ? '#ffffff' : '#ffffff44'}>
          <span class="lbl">{c.label}</span>
          <span class="dots">{#each [0, 1, 2, 3] as i}<i style:opacity={c.dots < 0 ? 0 : i < c.dots ? 1 : 0.3}></i>{/each}</span>
        </div>
      {/each}
    </div>
    <div class="clock" data-testid="strip-clock">{clock}</div>
    <div class="right">
      {#each right as r}<span class="lbl">{r}</span>{/each}
      <span class="bat" aria-label="battery {battery}%"><i style:width="{battery}%"></i></span>
    </div>
  </div>
  <div class="hairline"></div>
</div>

<style>
  .status-strip { position: absolute; top: 0; left: 0; right: 0; z-index: 20; pointer-events: none; }
  .row { display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; gap: 4px; min-height: 20px; }
  .left, .right { display: flex; align-items: center; }
  .chip { display: flex; flex-direction: column; align-items: center; color: var(--ink); }
  .lbl { font: 700 10px/1.15 var(--type-family-mono); color: inherit; padding: 0 3px; text-shadow: 0 1px 1.5px #000000cc; white-space: nowrap; }
  .right .lbl { color: #fff; }
  .dots { display: flex; gap: 1.5px; padding-top: 1px; }
  .dots i { width: 2px; height: 2px; border-radius: 50%; background: currentColor; }
  .clock { position: absolute; left: 50%; transform: translateX(-50%); font: 700 12px/1.2 var(--type-family-mono); color: #fff; text-shadow: 0 1px 2px #000000cc; white-space: nowrap; }
  .bat { margin-left: 4px; width: 18px; height: 9px; border: 1px solid #fff; border-radius: 2px; position: relative; padding: 1px; box-sizing: border-box; }
  .bat::after { content: ''; position: absolute; right: -3px; top: 2px; width: 2px; height: 3px; background: #fff; border-radius: 0 1px 1px 0; }
  .bat i { display: block; height: 100%; background: #fff; border-radius: 1px; }
  .hairline { height: max(1px, 0.75px); background: #ffffff33; }
</style>
