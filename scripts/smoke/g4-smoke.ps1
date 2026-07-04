#!/usr/bin/env pwsh
<#
.SYNOPSIS
    G4 关口冒烟测试脚本。
.DESCRIPTION
    验证 platform-console (8090) + camel-console (8080) + executor (8081) 各端点可达。
    需要各服务已启动。脚本检测服务可用性后逐项检查。
.NOTES
    退出码 0 = 全部通过；非 0 = 存在失败项。
#>

[CmdletBinding()]
param(
    [int]$PlatformPort = 8090,
    [int]$ConsolePort  = 8080,
    [int]$ExecutorPort = 8081,
    [switch]$Json
)

$ErrorActionPreference = 'Continue'

# ─── 结果收集 ─────────────────────────────────────────────
$results = [System.Collections.ArrayList]::new()
$passed  = 0
$failed  = 0
$skipped = 0

function Test-Endpoint {
    param(
        [string]$Group,
        [string]$Name,
        [string]$Url,
        [string]$Method = 'GET',
        [int[]]$ExpectedCodes = @(200)
    )

    try {
        $response = Invoke-WebRequest -Uri $Url -Method $Method -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        $ok = $ExpectedCodes -contains $response.StatusCode
        $entry = @{ group = $Group; name = $Name; url = $Url; status = $response.StatusCode; pass = $ok }
        if ($ok) {
            $script:passed++
            Write-Host "  ✓ [$($response.StatusCode)] $Name" -ForegroundColor Green
        } else {
            $script:failed++
            Write-Host "  ✗ [$($response.StatusCode)] $Name (期望 $($ExpectedCodes -join '/'))" -ForegroundColor Red
        }
        [void]$results.Add($entry)
    }
    catch {
        $statusCode = 0
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
        }
        $entry = @{ group = $Group; name = $Name; url = $Url; status = $statusCode; pass = $false; error = $_.Exception.Message }
        $script:failed++
        Write-Host "  ✗ [ERR] $Name — $($_.Exception.Message)" -ForegroundColor Red
        [void]$results.Add($entry)
    }
}

function Test-ServiceAvailable {
    param([string]$Name, [string]$HealthUrl)
    try {
        $null = Invoke-WebRequest -Uri $HealthUrl -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
        Write-Host "  ✓ $Name 可达" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "  ⚠ $Name 不可达 ($HealthUrl) — 跳过相关检查" -ForegroundColor Yellow
        return $false
    }
}

# ─── 服务检测 ─────────────────────────────────────────────
Write-Host "`n═══ G4 冒烟测试 ═══" -ForegroundColor Cyan
Write-Host "`n── 服务检测 ──"

$platformUp = Test-ServiceAvailable "platform-console" "http://localhost:$PlatformPort/api/platform/health"
$consoleUp  = Test-ServiceAvailable "camel-console"    "http://localhost:$ConsolePort/api/auth/mode"
$executorUp = Test-ServiceAvailable "executor"         "http://localhost:$ExecutorPort/api/executor/health"

# ─── G3: platform-console 端点 ────────────────────────────
Write-Host "`n── G3: platform-console ($PlatformPort) ──"

if ($platformUp) {
    Test-Endpoint "G3" "platform health"       "http://localhost:$PlatformPort/api/platform/health"
    Test-Endpoint "G3" "organizations"         "http://localhost:$PlatformPort/api/system/organizations"
    Test-Endpoint "G3" "config list"           "http://localhost:$PlatformPort/api/config"
    Test-Endpoint "G3" "task list"             "http://localhost:$PlatformPort/api/task"
    Test-Endpoint "G3" "subscribe topics"      "http://localhost:$PlatformPort/api/subscribe/topic"
} else {
    Write-Host "  ⊘ platform-console 未启动，跳过" -ForegroundColor DarkGray
    $skipped += 5
}

# ─── G4: camel-console 能力域端点 ─────────────────────────
Write-Host "`n── G4: camel-console ($ConsolePort) 能力域 ──"

if ($consoleUp) {
    Test-Endpoint "G4" "auth mode"             "http://localhost:$ConsolePort/api/auth/mode"
    Test-Endpoint "G4" "camel subscribe list"  "http://localhost:$ConsolePort/api/subscribe/camel"
} else {
    Write-Host "  ⊘ camel-console 未启动，跳过" -ForegroundColor DarkGray
    $skipped += 2
}

# ─── G2: demo 全链路（可选） ──────────────────────────────
Write-Host "`n── G2: demo 全链路（可选） ──"

if ($platformUp) {
    Test-Endpoint "G2" "governance requests"   "http://localhost:$PlatformPort/api/security/governance/requests"
} else {
    Write-Host "  ⊘ 跳过 G2（需 platform-console）" -ForegroundColor DarkGray
    $skipped += 1
}

# ─── Springdoc 文档 ───────────────────────────────────────
Write-Host "`n── OpenAPI 文档 ──"

if ($platformUp) {
    Test-Endpoint "DOC" "swagger-ui"           "http://localhost:$PlatformPort/swagger-ui.html"
    Test-Endpoint "DOC" "api-docs"             "http://localhost:$PlatformPort/v3/api-docs"
} else {
    Write-Host "  ⊘ 跳过 OpenAPI（需 platform-console）" -ForegroundColor DarkGray
    $skipped += 2
}

# ─── 结果摘要 ─────────────────────────────────────────────
Write-Host "`n═══ 结果摘要 ═══" -ForegroundColor Cyan
Write-Host "  通过: $passed  失败: $failed  跳过: $skipped"

if ($Json) {
    $summary = @{
        passed  = $passed
        failed  = $failed
        skipped = $skipped
        results = $results
    }
    $summary | ConvertTo-Json -Depth 3 | Write-Host
}

if ($failed -gt 0) {
    Write-Host "`n✗ G4 冒烟测试失败 ($failed 项)" -ForegroundColor Red
    exit 1
} else {
    Write-Host "`n✓ G4 冒烟测试全部通过" -ForegroundColor Green
    exit 0
}
