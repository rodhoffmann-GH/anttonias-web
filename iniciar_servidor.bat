@echo off
title Anttonias WEB - Servidor de Desarrollo Local
color 0B

set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "F:\Antigravity\Anttonias WEB"

echo ============================================================
echo      Iniciando Servidor de Desarrollo - Anttonias WEB
echo      Astro 5 + Vanilla CSS + Lenis + Cloudflare Edge
echo ============================================================
echo.

where node >nul 2>nul
if errorlevel 1 goto node_missing

if not exist node_modules goto install_deps
goto start_server

:node_missing
color 0C
echo [ERROR] Node.js no se encuentra en la ruta.
pause
exit /b 1

:install_deps
echo Instalando dependencias del proyecto...
call "C:\Program Files\nodejs\npm.cmd" install
if errorlevel 1 (
    echo Error al instalar dependencias.
    pause
    exit /b 1
)

:start_server
echo Abriendo vista previa en http://localhost:4330 ...
start "" "http://localhost:4330"

echo Ejecutando Astro Dev Server en puerto 4330...
call "C:\Program Files\nodejs\npm.cmd" run dev

if errorlevel 1 (
    echo.
    echo Ocurrio un error al ejecutar el servidor de desarrollo.
    pause
)

pause
