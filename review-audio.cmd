@echo off
setlocal
cd /d "%~dp0"
set "AUDIO_REVIEW_NODE=%CD%\.tools\node-v22.23.3-win-x64\node.exe"
if exist "%AUDIO_REVIEW_NODE%" (
  "%AUDIO_REVIEW_NODE%" scripts\malagasy-audio-review.mjs
) else (
  node scripts\malagasy-audio-review.mjs
)
if errorlevel 1 pause
