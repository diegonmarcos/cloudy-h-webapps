#!/bin/sh
# scan-dists.sh — no credential shape in anything the sites publish (#1320 M6). Run after the build.
#   GitHub tokens (ghp_/gho_/ghs_/github_pat_), JWTs (eyJ...eyJ...), PEM private keys, bearer literals, AWS keys.
set -eu
cd "$(dirname "$0")/.."
PAT='(gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY|Bearer [A-Za-z0-9._~+/-]{20,}=*|AKIA[0-9A-Z]{16})'
dirs=""
for d in sites/*/dist packages/c3-data/data; do [ -d "$d" ] && dirs="$dirs $d"; done
[ -n "$dirs" ] || { echo "scan-dists: nothing built" >&2; exit 1; }
# -o + cut: report the file and the match's first 12 characters only, never the whole value
if hits=$(grep -rEo "$PAT" $dirs 2>/dev/null); then
  echo "$hits" | sed -E 's/^([^:]+):(.{12}).*/\1: \2…/' | sort -u >&2
  echo "scan-dists: FAIL — credential-shaped strings in published files" >&2
  exit 1
fi
echo "scan-dists: ok ($dirs)"
