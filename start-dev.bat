@echo off
echo Starting Backend and Frontend servers...

:: First terminal - Start the backend server
start cmd /k "cd backend && npm run dev"

:: Wait a moment for backend to initialize
timeout /t 5

:: Second terminal - Start the frontend
start cmd /k "cd frontend && npm run dev"

echo Both servers started. Close this window to keep them running or press Ctrl+C to stop.
