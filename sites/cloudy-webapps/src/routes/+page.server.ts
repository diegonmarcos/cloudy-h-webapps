import { base } from '$app/paths';
import { superappView, shellData } from '$lib/server/nav';

export const load = () => ({ view: superappView(base, '')!, shell: shellData(base) });
