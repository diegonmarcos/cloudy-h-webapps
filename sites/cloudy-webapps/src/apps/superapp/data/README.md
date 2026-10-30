# SuperApp page bodies (seed content)

Hand-written page bodies copied from the old SuperApp web replica (`cloudy-h-webapps-desk` `a_Portals/cloud-superapp/src/data`,
commit 626c2db) by #1320 M2: `sections-content.json` (list/agenda/grid/cards bodies per section page), `sections-core.json`
(stack card rows and captions of the aggregator sections), `linktree.json`, `mock-apps.json`, `shell.json` (status strip mock,
drawer identity). They are content, not navigation: every section, page, label, icon and target comes from the GENERATED
`packages/cloudy-ui/nav/nav.json`. A body whose section/page id no longer exists in nav.json is simply not used.
