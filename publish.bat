@echo off
echo ==============================================
echo MOHO - GitHub Pages Publisher
echo ==============================================
echo.
echo Please wait, preparing files...

cd /d "%~dp0"

git init
git add .
git commit -m "Initial commit for GitHub Pages"
git branch -M main

:: This line removes the remote if it exists to avoid errors, then adds the new one.
git remote remove origin 2>nul
git remote add origin https://github.com/MOHOAI/MOHO-Naruto.git

echo.
echo Ready to upload to GitHub...
echo If a window pops up, please log in to your GitHub account!
echo.
git push -u origin main --force

echo.
echo ==============================================
echo Done! Press any key to close this window.
pause
