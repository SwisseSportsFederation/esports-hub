@ECHO OFF
set /p Version=<.nvmrc
nvm install %Version%
nvm use %Version%