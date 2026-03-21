@echo off
echo === Next.js Force Start with Cache Clear ===
echo 1. Killing port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
  echo Killing PID %%a
  taskkill /PID %%a /F 2^>nul
)

echo 2. Clearing .next cache...
rmdir /s /q .next 2^>nul

echo 3. Starting dev server...
npm run dev

echo Server should now be at http://localhost:3000
pause

