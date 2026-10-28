# cloud-h-webapps (renamed from cloud-webapps, 2026-10-28; the published Pages path stays /cloud-webapps/)

One independent site per Cloud APK (cloud-mail, cloud-drive, ...), all sharing one generated top nav (`_shared/dist/nav.js`).
Moved out of `diegonmarcos.github.io/cloud-webapps` (#1062). Pages is still served by diegonmarcos.github.io,
which pins this repo as a submodule; `.github/workflows/bump-pages.yml` bumps that pin on every push.

Note: `scripts/gen-nav.mjs` still reads `../a_Portals/cloud-superapp/...` from the Pages repo layout; it runs there until the list is vendored here.
