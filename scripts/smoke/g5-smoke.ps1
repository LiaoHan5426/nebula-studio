# G5 关口冒烟：platform-console 平台闭环 REST
param(
    [string]$PlatformBase = "http://localhost:8090",
    [string]$ExecutorBase = "http://localhost:8081"
)

$ErrorActionPreference = "Stop"
$passed = 0
$failed = 0

function Test-Endpoint {
    param([string]$Name, [string]$Url, [int[]]$ExpectedStatus = @(200))
    try {
        $resp = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10
        if ($ExpectedStatus -contains $resp.StatusCode) {
            Write-Host "[PASS] $Name ($($resp.StatusCode))" -ForegroundColor Green
            $script:passed++
        } else {
            Write-Host "[FAIL] $Name — expected $($ExpectedStatus -join '/'), got $($resp.StatusCode)" -ForegroundColor Red
            $script:failed++
        }
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        if ($code -and ($ExpectedStatus -contains $code)) {
            Write-Host "[PASS] $Name ($code)" -ForegroundColor Green
            $script:passed++
        } else {
            Write-Host "[FAIL] $Name — $($_.Exception.Message)" -ForegroundColor Red
            $script:failed++
        }
    }
}

Write-Host "=== G5 Smoke: Platform Console ===" -ForegroundColor Cyan
Test-Endpoint "Health" "$PlatformBase/api/platform/health"
Test-Endpoint "OpenAPI" "$PlatformBase/v3/api-docs"
Test-Endpoint "Swagger UI" "$PlatformBase/swagger-ui.html"
Test-Endpoint "Resource API" "$PlatformBase/api/resource"
Test-Endpoint "Governance requests" "$PlatformBase/api/security/governance/approval/requests"
Test-Endpoint "Version API" "$PlatformBase/api/version/snapshots?resourceId=smoke-test"
Test-Endpoint "Release list" "$PlatformBase/api/release/all"
Test-Endpoint "Executor health" "$ExecutorBase/api/executor/health" @(200, 404)

Write-Host "`nResult: $passed passed, $failed failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
if ($failed -gt 0) { exit 1 }
