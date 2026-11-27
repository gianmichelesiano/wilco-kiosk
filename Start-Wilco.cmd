@echo off
cd /d "%~dp0"
where npm.cmd >nul 2>nul || (echo Install Node.js 24 LTS with npm, then reopen Wilco. & pause & exit /b 1)
if not exist node_modules\electron\dist\electron.exe (
  call npm.cmd install
  if errorlevel 1 (pause & exit /b 1)
)
node --env-file-if-exists=.env node_modules\electron\cli.js .
if errorlevel 1 pause
