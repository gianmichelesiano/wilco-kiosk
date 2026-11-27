@echo off
rem Double-tap, or Settings > Update Wilco: closes Wilco, pulls the latest version from GitHub, restarts Wilco.
rem .env, overrides.json, voice.json and cache\ are gitignored, so the update leaves them alone.
title Wilco update
cd /d "%~dp0"
where git >nul 2>nul || (echo Git for Windows is not installed. & goto fail)

echo Closing Wilco...
rem Wilco.exe is locked while it runs, and git cannot replace it. No /t: when Wilco starts this script, it is in Wilco's tree.
taskkill /im Wilco.exe /f >nul 2>nul
timeout /t 2 /nobreak >nul

echo Downloading the latest version...
for /f %%H in ('git rev-parse HEAD') do set "before=%%H"
git pull --ff-only || goto fail
git lfs pull || goto fail
for /f %%H in ('git rev-parse HEAD') do set "after=%%H"

echo.
if "%before%"=="%after%" (
  echo No new version: Wilco was already up to date.
) else (
  echo WILCO UPDATED. New in this version:
  git --no-pager log --format="  - %%s" %before%..%after%
)
echo.
echo Wilco restarts by itself in 10 seconds.
timeout /t 10 /nobreak >nul
call "%~dp0Start-Wilco.cmd"
exit /b

:fail
echo.
echo Update failed. Wilco restarts in 60 seconds. Tap X to close this window now.
timeout /t 60 >nul
call "%~dp0Start-Wilco.cmd"
exit /b 1
