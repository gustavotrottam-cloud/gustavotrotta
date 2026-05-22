@echo off
chcp 65001 >nul
title Site Gustavo Trotta - Dev Server
cd /d "%~dp0"

REM ==========================================================================
REM  Site Gustavo Trotta - Dev Server launcher
REM  Mata qualquer servidor antigo na porta 3000, instala deps se necessario,
REM  sobe o Next.js e abre o navegador.
REM ==========================================================================

REM === 1. Garante Node no PATH desta janela =================================
if exist "C:\Program Files\nodejs\node.exe" (
    set "PATH=C:\Program Files\nodejs;%PATH%"
)
where node >nul 2>nul
if errorlevel 1 (
    echo.
    echo [ERRO] Node.js nao encontrado.
    echo Instale a versao LTS em https://nodejs.org e tente de novo.
    echo.
    pause
    exit /b 1
)

REM === 2. Mata qualquer processo LISTENING na porta 3000 ====================
REM     (servidor anterior do mesmo projeto que ficou rodando)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 " ^| findstr LISTENING') do (
    echo Encerrando servidor anterior na porta 3000 ^(PID %%a^)...
    taskkill /F /PID %%a >nul 2>&1
)

REM === 3. Instala dependencias se for primeira execucao =====================
if not exist "node_modules" (
    echo.
    echo Primeira execucao detectada. Instalando dependencias...
    echo Isso leva 1-2 minutos. Aguarde.
    echo.
    call npm install --no-audit --no-fund
    if errorlevel 1 (
        echo.
        echo [ERRO] Falha ao instalar dependencias.
        pause
        exit /b 1
    )
)

REM === 4. Abre o navegador apos o server estar pronto =======================
start "" cmd /c "timeout /t 10 /nobreak >nul && start http://localhost:3000"

echo.
echo ==========================================
echo   Site Gustavo Trotta - Dev Server
echo ==========================================
echo.
echo   Endereco: http://localhost:3000
echo   Navegador abre em ~10 segundos.
echo.
echo   Para parar: feche esta janela ou Ctrl+C
echo ==========================================
echo.

REM === 5. Sobe o Next.js (bloqueia ate o usuario fechar) ====================
npm run dev
