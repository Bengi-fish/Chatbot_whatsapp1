@echo off
echo Iniciando Backend y Frontend...
echo.

start cmd /k "cd backend && npm run dev:dashboard"
timeout /t 3 /nobreak > nul
start cmd /k "cd frontend-react && npm run dev"

echo.
echo Backend: http://localhost:3009
echo Frontend: http://localhost:5173
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause > nul
