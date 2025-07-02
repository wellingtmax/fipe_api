#!/usr/bin/env pwsh

# Script para iniciar o servidor backend
Write-Host "🚀 Iniciando servidor Backend..." -ForegroundColor Green

Set-Location "d:\Usuários\wellington.oliveira\Desktop\testangulaComApi\fipe_api"

Write-Host "📂 Pasta atual: $(Get-Location)" -ForegroundColor Yellow

Write-Host "🔍 Verificando se package.json existe..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    Write-Host "✅ package.json encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ package.json não encontrado" -ForegroundColor Red
    exit 1
}

Write-Host "🔍 Verificando se server.js existe..." -ForegroundColor Yellow
if (Test-Path "server.js") {
    Write-Host "✅ server.js encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ server.js não encontrado" -ForegroundColor Red
    exit 1
}

Write-Host "🔧 Executando npm start..." -ForegroundColor Cyan
npm start
