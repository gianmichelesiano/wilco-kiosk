#!/bin/zsh -l
# Builds dist/Wilco-windows.zip on the Mac: Electron for Windows x64 + the app. On the PC: unzip, open Wilco.exe, no Node.
set -eu
cd -- "${0:A:h}"
export PATH="$PATH:/opt/homebrew/bin:/usr/local/bin"
[[ -d node_modules/@electron/get ]] || npm install --no-audit --no-fund
version=$(node -p "require('electron/package.json').version")
# Downloads once, checks the SHA-256 and keeps it in the Electron cache.
electron_zip=$(node -e "require('@electron/get').downloadArtifact({version:'$version',platform:'win32',arch:'x64',artifactName:'electron'}).then(console.log)")
stage=$(mktemp -d)
trap 'rm -rf -- "$stage"' EXIT
root="$stage/Wilco"
ditto -x -k "$electron_zip" "$root"
mv "$root/electron.exe" "$root/Wilco.exe"
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
