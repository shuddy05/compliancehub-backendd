# Start the server in the background and test endpoints
Write-Host "Starting NestJS server..." -ForegroundColor Green

# Kill existing node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start the server
$serverJob = Start-Job -ScriptBlock {
    Set-Location 'c:\Users\USER\Desktop\Aegis\aegis-flow\NestJS backend\compliancehub'
    npm start
}

# Wait for server to start
Write-Host "Waiting for server to start (15 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Test if server is responding
Write-Host "`nTesting API endpoints..." -ForegroundColor Green

$endpoints = @(
    "http://localhost:3000/api/v1",
    "http://localhost:3000/api/v1/companies",
    "http://localhost:3000/api/v1/auth/register",
    "http://localhost:3000/api/v1/notifications",
    "http://localhost:3000/api/v1/subscriptions/plans"
)

foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-WebRequest -Uri $endpoint -Method GET -ErrorAction Stop -UseBasicParsing
        Write-Host "✓ $endpoint - Status: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "✗ $endpoint - Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nServer job ID: $($serverJob.Id)" -ForegroundColor Cyan
Write-Host "Use 'Stop-Job -Id $($serverJob.Id)' to stop the server" -ForegroundColor Cyan
