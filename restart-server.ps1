# Stop any existing node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Navigate to server directory and start
Set-Location -Path "server"
npm start 