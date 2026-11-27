#!/bin/zsh -l
set -eu
cd -- "${0:A:h}"
if [[ ! -d Wilco.app ]]; then ./Build-Wilco-Mac.command; fi
settings="$HOME/Library/Application Support/NGFT Wilco"
mkdir -p "$settings"
for item in .env demo.json; do
  if [[ -f "$item" && ! -e "$settings/$item" ]]; then cp "$item" "$settings/$item"; fi
done
exec /usr/bin/open -a "$PWD/Wilco.app"
