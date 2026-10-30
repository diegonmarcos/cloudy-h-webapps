<script lang="ts">
  // LauncherStatusStrip (launcher/LauncherStatusStrip.kt): LEFT network chips (NetworkSections.ORDER) | CENTRE clock
  // "dd-MM-yyyy HH:mm EEE" | RIGHT RAM . Storage . CPU . battery, monospace bold, then a 0.75dp #33FFFFFF hairline.
  // StripRow: the clock stays at true centre and each side gets the same room; when clock + 2 x max(left, right) + 2 gaps
  // does not fit, all three are scaled by ONE factor (stripScale). The chips are the replica's mock; the clock is live.
  import { onMount } from 'svelte';
  type Chip = { label: string; on: boolean; dots: number };
  let { chips = [], right = [], battery = 84 }: { chips?: Chip[]; right?: string[]; battery?: number } = $props();
  const fmt = (d: Date) => {
    const p = (n: number) => String(n).padStart(2, '0');
    return `${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())} ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]}`;
  };
  let clock = $state('');
  let row = $state(0), lw = $state(0), cw = $state(0), rw = $state(0);
  const GAP = 4;
  const scale = $derived.by(() => {
    const room = row - 20 - 2 * GAP, need = cw + 2 * Math.max(lw, rw);
    return !row || need <= 0 || need <= room ? 1 : Math.max(0, room) / need;
  });
  onMount(() => {
    clock = fmt(new Date());
    const t = setInterval(() => (clock = fmt(new Date())), 15_000);
    return () => clearInterval(t);
  });
</script>

<div class="status-strip" data-testid="strip" style:--s={scale}>
  <div class="row" bind:clientWidth={row}>
    <div class="left" bind:clientWidth={lw}>
      {#each chips as c, ci (ci)}
        <div class="chip" style:--ink={c.on ? '#ffffff' : '#ffffff44'}>
          <span class="lbl">{c.label}</span>
          <span class="dots">{#each [0, 1, 2, 3] as i}<i style:opacity={c.dots < 0 ? 0 : i < c.dots ? 1 : 0.3}></i>{/each}</span>
        </div>
      {/each}
    </div>
    <div class="clock" data-testid="strip-clock" bind:clientWidth={cw}>{clock}</div>
    <div class="right" bind:clientWidth={rw}>
      {#each right as r}<span class="lbl">{r}</span>{/each}
      <span class="bat" aria-label="battery {battery}%"><i style:width="{battery}%"></i></span>
    </div>
  </div>
  <div class="hairline"></div>
</div>

<style>
  .status-strip { position: absolute; top: 0; left: 0; right: 0; z-index: 20; pointer-events: none; }
  .row { position: relative; display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; min-height: 20px; height: calc(8px + 20px * var(--s)); }
  .left, .right { display: flex; align-items: center; transform: scale(var(--s)); }
  .left { transform-origin: left center; } .right { transform-origin: right center; }
  .chip { display: flex; flex-direction: column; align-items: center; color: var(--ink); }
  .lbl { font: 700 10px/1.15 var(--type-family-mono); color: inherit; padding: 0 3px; text-shadow: 0 1px 1.5px #000000cc; white-space: nowrap; }
  .right .lbl { color: #fff; }
  .dots { display: flex; gap: 1.5px; padding-top: 1px; }
  .dots i { width: 2px; height: 2px; border-radius: 50%; background: currentColor; }
  .clock { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%) scale(var(--s)); font: 700 12px/1.2 var(--type-family-mono); color: #fff; text-shadow: 0 1px 2px #000000cc; white-space: nowrap; }
  .bat { margin-left: 4px; width: 18px; height: 9px; border: 1px solid #fff; border-radius: 2px; position: relative; padding: 1px; box-sizing: border-box; }
  .bat::after { content: ''; position: absolute; right: -3px; top: 2px; width: 2px; height: 3px; background: #fff; border-radius: 0 1px 1px 0; }
  .bat i { display: block; height: 100%; background: #fff; border-radius: 1px; }
  .hairline { height: max(1px, 0.75px); background: #ffffff33; }
</style>
