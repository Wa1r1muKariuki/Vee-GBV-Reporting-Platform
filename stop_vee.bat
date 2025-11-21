@echo off
echo Stopping Vee services...

REM Kill processes by window title
taskkill /FI "WINDOWTITLE eq FastAPI*" /F /T 2>nul
taskkill /FI "WINDOWTITLE eq Rasa*" /F /T 2>nul
taskkill /FI "WINDOWTITLE eq Frontend*" /F /T 2>nul

REM Kill processes by port
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5005" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5055" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul

echo All services stopped.
pause