// Embed contract (aa_cloud-superapp build.json ui.sections[cloud].pages[webapps]): the APK opens webapps_base + '?embed=1'
// and appends the user-agent marker ' CloudSuperApp-Embed/1'. Embedded = no status strip, no top row, no bottom island.
export const EMBED_UA = 'CloudSuperApp-Embed';
export const EMBED_KEY = 'cloudy:embed';

export function isEmbed(search: string, userAgent: string, stored: string | null): boolean {
  return /[?&]embed=1(&|$)/.test(search) || userAgent.includes(EMBED_UA) || stored === '1';
}

/** The inline <head> script (runs before first paint, so the chrome never flashes in the APK's pane): embed + theme. */
export function bootScript(themeIds: readonly string[], defaultTheme: string): string {
  return `(function(){var d=document.documentElement,s=location.search,e=/[?&]embed=1(&|$)/.test(s)||navigator.userAgent.indexOf(${JSON.stringify(EMBED_UA)})>=0;` +
    `try{e=e||sessionStorage.getItem(${JSON.stringify(EMBED_KEY)})==='1';if(e)sessionStorage.setItem(${JSON.stringify(EMBED_KEY)},'1')}catch(x){}` +
    `if(e){d.classList.add('embed');d.setAttribute('data-embed','1')}` +
    `var T=${JSON.stringify(themeIds)},q=new URLSearchParams(s).get('theme'),t=null;try{t=localStorage.getItem('cloudy:theme')}catch(x){}` +
    `if(q&&T.indexOf(q)>=0){t=q;try{localStorage.setItem('cloudy:theme',q)}catch(x){}}` +
    `d.setAttribute('data-theme',t&&T.indexOf(t)>=0?t:${JSON.stringify(defaultTheme)});` +
    `var w=innerWidth,h=innerHeight;d.dataset.layout=w>=840?'expanded':w>=600?'medium':'compact';d.dataset.panes=Math.min(w,h)>=600?'2':'1'})();`;
}
