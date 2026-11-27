#!/bin/zsh -l
set -eu
cd -- "${0:A:h}"
export PATH="$PATH:/opt/homebrew/bin:/usr/local/bin"
if [[ ! -x node_modules/electron/dist/Electron.app/Contents/MacOS/Electron ]]; then
  npm install --no-audit --no-fund
  node -e "require('electron')"
fi
base="${1:-$PWD}"
dest="$base/Wilco.app"
if [[ -e "$dest" ]]; then
  print -u2 "Wilco.app esiste già: $dest"
  exit 1
fi
stage=$(mktemp -d "$base/.wilco-build.XXXXXX")
trap 'rm -rf -- "$stage"' EXIT
bundle="$stage/Wilco.app"
ditto node_modules/electron/dist/Electron.app "$bundle"
resources="$bundle/Contents/Resources"
mkdir "$resources/app"
cp package.json main.cjs knowledge.cjs preload.cjs index.html ui.js settings.js strings.js presence.js style.css wilco.png ngft-logo.svg er-logo.png catalog.json demo.example.json "$resources/app/"
ditto knowledge "$resources/app/knowledge"
ditto fonts "$resources/app/fonts"
ditto vendor "$resources/app/vendor"
if [[ -d media ]]; then ditto media "$resources/app/media"; fi
rm "$resources/default_app.asar"
plist="$bundle/Contents/Info.plist"
for name in CFBundleName CFBundleDisplayName; do plutil -replace "$name" -string Wilco "$plist"; done
plutil -replace CFBundleIdentifier -string com.ngft.wilco.kiosk "$plist"
plutil -remove ElectronAsarIntegrity "$plist"
codesign --force --deep --sign - "$bundle"
codesign --verify --deep --strict "$bundle"
mv "$bundle" "$dest"
print "Pronto: $dest"
