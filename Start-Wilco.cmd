@echo off
rem Opens this folder with the Electron runtime in windows\ (Git LFS): no Node needed. Keys: .env next to this file.
set "exe=%~dp0windows\Wilco.exe"
if not exist "%exe%" goto missing
for %%F in ("%exe%") do if %%~zF LSS 1000000 goto missing
start "" "%exe%" "%~dp0."
exit /b
:missing
echo windows\Wilco.exe is missing. Install Git for Windows, then run "git lfs pull" in this folder.
pause
exit /b 1
