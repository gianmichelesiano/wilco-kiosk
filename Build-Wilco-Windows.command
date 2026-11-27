#!/bin/zsh -l
# windows/: Electron for Windows x64 (Git LFS). Start-Wilco.cmd runs this folder with it, so the PC needs no Node.
# Also builds dist/Wilco-windows.zip for the GitHub Release: runtime + a copy of the app, opened with Wilco.exe.
set -eu
cd -- "${0:A:h}"
export PATH="$PATH:/opt/homebrew/bin:/usr/local/bin"
[[ -d node_modules/@electron/get ]] || npm install --no-audit --no-fund
version=$(node -p "require('electron/package.json').version")
if [[ "$(cat windows/version 2>/dev/null)" != "$version" ]]; then
  # Downloads once, checks the SHA-256 and keeps it in the Electron cache.
  electron_zip=$(node -e "require('@electron/get').downloadArtifact({version:'$version',platform:'win32',arch:'x64',artifactName:'electron'}).then(console.log)")
  rm -rf windows
  ditto -x -k "$electron_zip" windows
  mv windows/electron.exe windows/Wilco.exe
  print "windows/ aggiornato a Electron $version: committare windows/"
fi
stage=$(mktemp -d)
trap 'rm -rf -- "$stage"' EXIT
root="$stage/Wilco"
ditto windows "$root"
rm "$root/resources/default_app.asar"
app="$root/resources/app"
mkdir "$app"
cp package.json main.cjs knowledge.cjs preload.cjs index.html ui.js settings.js strings.js style.css wilco.png ngft-logo.svg er-logo.png catalog.json demo.example.json "$app/"
ditto knowledge "$app/knowledge"
ditto fonts "$app/fonts"
[[ -d media ]] && ditto media "$app/media"
# Next to Wilco.exe: keys template, guide, and the stand team's state if present (main.cjs settingsDir).
cp .env.example "$root/.env.example"
cp README-Windows.md "$root/LEGGIMI.txt"
for f in overrides.json voice.json demo.json; do [[ -f $f ]] && cp $f "$root/"; done
[[ -d cache ]] && ditto cache "$root/cache"
mkdir -p dist
out="$PWD/dist/Wilco-windows.zip"
rm -f "$out"
(cd "$stage" && zip -qr -X "$out" Wilco)
print "Pronto: $out (Electron $version)"
