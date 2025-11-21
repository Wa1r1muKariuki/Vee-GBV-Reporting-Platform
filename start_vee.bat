@echo off
echo Starting Vee GBV Reporting System...
echo.

REM Activate virtual environment
call venv\Scripts\activate

REM Check if Rasa model exists
if not exist "models" (
    echo Training Rasa model... This may take a few minutes.
    rasa train
)

REM Create logs directory
if not exist "logs" mkdir logs

REM Initialize database
echo Initializing database...
cd backend
python -c "from database import init_db; init_db()"
cd ..

echo.
echo Starting services...
echo.

REM Start FastAPI Backend
echo [1/4] Starting FastAPI Backend...
start "FastAPI" cmd /k "venv\Scripts\activate && cd backend && uvicorn app:app --reload --port 8000"
timeout /t 5 /nobreak >nul

REM Start Rasa Actions
echo [2/4] Starting Rasa Actions...
start "Rasa Actions" cmd /k "venv\Scripts\activate && rasa run actions --port 5055"
timeout /t 5 /nobreak >nul

REM Start Rasa Server
echo [3/4] Starting Rasa Server...
start "Rasa Server" cmd /k "venv\Scripts\activate && rasa run --enable-api --cors * --port 5005"
timeout /t 8 /nobreak >nul

REM Start Frontend
echo [4/4] Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo ===================================
echo Vee is now running!
echo ===================================
echo.
echo Frontend:  http://localhost:3000
echo Backend:   http://localhost:8000/docs
echo Rasa:      http://localhost:5005
echo.
echo Close this window or press Ctrl+C to stop all services
echo.
pause