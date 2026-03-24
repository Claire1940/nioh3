@echo off
echo Clearing Next.js cache...
rmdir /s /q .next 2>nul
echo Cache cleared!
echo.
echo Please also clear your browser cache:
echo 1. Press Ctrl+Shift+Delete
echo 2. Select "Cached images and files"
echo 3. Click "Clear data"
echo.
pause
