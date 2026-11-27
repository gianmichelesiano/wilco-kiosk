#!/bin/zsh -l
# Double-click, or Settings > Update Wilco: quits Wilco, pulls the latest version from GitHub,
# rebuilds Wilco.app when the code changed and opens Wilco again.
# The keys, the stand team's edits and the prepared answers live in ~/Library/Application Support/NGFT Wilco: the update leaves them alone.
set -u
cd -- "${0:A:h}"
export PATH="$PATH:/opt/homebrew/bin:/usr/local/bin"
fail() {
  [[ -d .Wilco-old.app && ! -d Wilco.app ]] && mv .Wilco-old.app Wilco.app
  print "\nUpdate failed. Wilco restarts in 60 seconds."
  sleep 60
  exec ./Start-Wilco.command
}

print "Closing Wilco..."
pkill -f "$PWD/Wilco.app/Contents/MacOS/Electron"
sleep 2

print "Downloading the latest version..."
before=$(git rev-parse HEAD) || fail
git pull --ff-only || fail
after=$(git rev-parse HEAD)

print
if [[ $before == $after ]]; then
  print "Nothing new on GitHub."
else
  print "WILCO UPDATED. New in this version:"
  git --no-pager log --format='  - %s' $before..$after
fi

# Wilco.app holds a copy of the code, and records its commit: build it again when that is not the clone's.
built=$(cat Wilco.app/Contents/Resources/app/commit 2>/dev/null)
if [[ $built != $after ]]; then
  print "Building Wilco.app from this version..."
  git diff --quiet ${built:-$after} $after -- package.json package-lock.json 2>/dev/null || npm install --no-audit --no-fund || fail
  rm -rf .Wilco-old.app
  [[ -d Wilco.app ]] && mv Wilco.app .Wilco-old.app
  ./Build-Wilco-Mac.command || fail
  rm -rf .Wilco-old.app
fi

print "\nWilco restarts by itself in 10 seconds."
sleep 10
exec ./Start-Wilco.command
