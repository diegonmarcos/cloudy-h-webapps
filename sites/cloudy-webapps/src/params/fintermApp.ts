// Matches only the FinTerm app's id (nav/finterm.json app_id, follows the Android folder rename), so /<app>/<tab>/<dashboard>/ is a dashboard page
// and every other three-segment path stays with the catch-all.
import finterm from '@cloudy/ui/nav/finterm.json';
export const match = (param: string): boolean => param === finterm.app_id;
