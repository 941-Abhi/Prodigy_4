@echo off
echo Starting Chat Application Servers...
echo.

echo Starting Backend Server (Port 5000)...
start "Backend Server" cmd /k "cd /d C:\Users\abhis\Prodigy_4\project && npm start"

echo Starting Frontend Server (Port 3000)...
start "Frontend Server" cmd /k "cd /d C:\Users\abhis\Prodigy_4\project\client && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
pause > nul 