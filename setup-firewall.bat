@echo off
echo Setting up Windows Firewall rules for Social Media Automation...
echo.
echo This script will create firewall rules to allow network access.
echo Please run this script as Administrator.
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running as Administrator - proceeding with firewall setup...
    echo.
) else (
    echo ERROR: This script must be run as Administrator!
    echo Right-click on this file and select "Run as administrator"
    pause
    exit /b 1
)

REM Create firewall rule for backend (port 8000)
echo Creating firewall rule for backend (port 8000)...
netsh advfirewall firewall add rule name="Social Media Backend" dir=in action=allow protocol=TCP localport=8000
if %errorLevel% == 0 (
    echo ✓ Backend firewall rule created successfully
) else (
    echo ✗ Failed to create backend firewall rule
)

REM Create firewall rule for frontend (port 8080)
echo Creating firewall rule for frontend (port 8080)...
netsh advfirewall firewall add rule name="Social Media Frontend" dir=in action=allow protocol=TCP localport=8080
if %errorLevel% == 0 (
    echo ✓ Frontend firewall rule created successfully
) else (
    echo ✗ Failed to create frontend firewall rule
)

echo.
echo Firewall setup complete!
echo.
echo Your application is now configured for network access:
echo - Frontend: http://192.168.1.2:8080
echo - Backend:  http://192.168.1.2:8000
echo.
echo You can now access your application from other devices on your network.
echo.
pause
