# Data Viewer — development entry
# Requires: Node.js >= 24, pnpm >= 10
param(
    [int]$Port = 3000
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Error "pnpm or npm is required. Install Node.js from https://nodejs.org/"
    }
    Write-Host "pnpm not found; using npx pnpm@10.20.0 ..."
    function script:Invoke-Pnpm { npx pnpm@10.20.0 @args }
} else {
    function script:Invoke-Pnpm { pnpm @args }
}

if (-not (Test-Path "node_modules")) {
    Write-Host "Running pnpm install ..."
    Invoke-Pnpm install
}

Write-Host "Starting Data Viewer dev server ..."
Write-Host "  Standalone editor: http://localhost:$Port/editor"
Write-Host "  Embed (plugin):    http://localhost:$Port/widget"
$env:PORT = "$Port"
Invoke-Pnpm dev:www
