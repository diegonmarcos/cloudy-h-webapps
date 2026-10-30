<script lang="ts">
  // Home3DFragment: NeonCube in a 360dp box, centred. Glow = accent in three widening low-alpha strokes, edges in text_primary
  // fading toward the back, vertices as accent dots. Reduced motion = the still frame (animation off on Android).
  import { onMount } from 'svelte';
  import { drawCube } from './fx';
  let canvas: HTMLCanvasElement;
  onMount(() => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const cs = getComputedStyle(canvas);
    const ink = cs.getPropertyValue('--role-text-primary').trim() || '#fff';
    const glow = cs.getPropertyValue('--role-accent').trim() || '#c7aefb';
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const d = devicePixelRatio || 1;
    canvas.width = Math.round(canvas.clientWidth * d); canvas.height = Math.round(canvas.clientHeight * d);
    const start = performance.now();
    let raf = 0;
    const frame = (now: number) => { drawCube(ctx, canvas.width, canvas.height, still ? 0 : now - start, ink, glow); if (!still) raf = requestAnimationFrame(frame); };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  });
</script>

<div class="home-cube" data-testid="home-cube"><canvas bind:this={canvas} aria-label="Home"></canvas></div>

<style>
  .home-cube { position: absolute; inset: 0; display: grid; place-items: center; }
  canvas { width: 360px; height: 360px; max-width: 100%; }
</style>
