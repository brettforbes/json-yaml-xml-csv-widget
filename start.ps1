# Data Viewer — development entry
# Requires: Node.js >= 22.12 (Vite 8) — Node >= 24 recommended
param(
    [int]$Port = 3000
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

function Get-NodeExeVersion {
    param([string]$NodeExe)
    if (-not (Test-Path $NodeExe)) { return $null }
    $raw = & $NodeExe -v 2>$null
    if (-not $raw) { return $null }
    return [Version]($raw -replace '^v', '')
}

function Prepend-PathEntry {
    param([string]$Entry)
    if (-not $Entry) { return }
    $parts = $env:Path -split ';' | Where-Object { $_ -and ($_ -ne $Entry) }
    $env:Path = (@($Entry) + $parts) -join ';'
}

function Ensure-CompatibleNode {
    $minimum = [Version]"22.12.0"
    $nodeExe = $null

    if ($env:NVM_SYMLINK -and (Test-Path (Join-Path $env:NVM_SYMLINK "node.exe"))) {
        $nodeExe = Join-Path $env:NVM_SYMLINK "node.exe"
        Prepend-PathEntry $env:NVM_SYMLINK
    } elseif (Get-Command node -ErrorAction SilentlyContinue) {
        $nodeExe = (Get-Command node).Source
    }

    $version = if ($nodeExe) { Get-NodeExeVersion $nodeExe } else { $null }
    if ($version -and $version -ge $minimum) {
        Write-Host "Node.js v$version"
        return
    }

    if (Get-Command nvm -ErrorAction SilentlyContinue) {
        foreach ($candidate in @("24", "22.13.0", "22")) {
            nvm use $candidate 2>$null | Out-Null
            if ($env:NVM_SYMLINK -and (Test-Path (Join-Path $env:NVM_SYMLINK "node.exe"))) {
                $nodeExe = Join-Path $env:NVM_SYMLINK "node.exe"
                Prepend-PathEntry $env:NVM_SYMLINK
            }
            $version = if ($nodeExe) { Get-NodeExeVersion $nodeExe } else { $null }
            if ($version -and $version -ge $minimum) {
                Write-Host "Switched to Node.js v$version (need >= $minimum for jsoncrack-react / Vite)"
                return
            }
        }
    }

    $current = if ($version) { "v$version" } else { "not found" }
    Write-Error @"
Node.js $minimum or newer is required (current: $current).
The jsoncrack-react package uses Vite 8, which fails on Node 20.9.

Fix (nvm-windows):
  nvm install 22.13.0
  nvm use 22.13.0
Then re-run .\start.ps1
"@
}

Ensure-CompatibleNode

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

Write-Host "Starting Data Viewer ..."
Write-Host "  App:               http://localhost:$Port/"
Write-Host "  Embed (iframe):    http://localhost:$Port/widget"
$env:PORT = "$Port"
Invoke-Pnpm dev:www
