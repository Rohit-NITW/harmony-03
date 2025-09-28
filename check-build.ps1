# Enable script execution for this session
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

# Run TypeScript check
Write-Host "Running TypeScript check..." -ForegroundColor Yellow
npx tsc --noEmit

# Run build check
Write-Host "Running build check..." -ForegroundColor Yellow
npm run build