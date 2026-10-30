// Matches only the FinTerm app's id (nav/finterm-app.json, follows the Android folder rename), so /<app>/<tab>/<dashboard>/ is a dashboard page
// and every other three-segment path stays with the catch-all. Reads the tiny app-id file: this module is in the client router manifest.
import app from '@cloudy/ui/nav/finterm-app.json';
export const match = (param: string): boolean => param === app.app_id;
