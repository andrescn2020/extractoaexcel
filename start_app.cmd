@echo off
echo Starting Backend...
start "Backend API" cmd /k "python -m uvicorn backend.api:app --host 127.0.0.1 --port 8000"
echo Starting Frontend...
start "Frontend Web App" cmd /k "cd frontend && npm run dev"
echo.
echo Application started!
echo Open your browser at http://localhost:5173
pause
