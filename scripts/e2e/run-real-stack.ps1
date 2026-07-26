[CmdletBinding()]
param(
    [string]$BackendRoot = "",
    [switch]$KeepServices
)

$ErrorActionPreference = "Stop"
if ([string]::IsNullOrWhiteSpace($BackendRoot)) {
    $BackendRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..\nebula")).Path
} else {
    $BackendRoot = (Resolve-Path $BackendRoot).Path
}
$studioRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$artifactRoot = Join-Path $studioRoot "test-results\real-stack"
New-Item -ItemType Directory -Force -Path $artifactRoot | Out-Null

$services = @(
    @{
        Name = "platform-console"
        Directory = Join-Path $BackendRoot "nebula-platform\platform-console"
        Health = "http://localhost:8090/api/platform/health"
    },
    @{
        Name = "camel-console"
        Directory = Join-Path $BackendRoot "demos\demo-camel-console"
        Health = "http://localhost:8080/api/auth/mode"
    },
    @{
        Name = "executor"
        Directory = Join-Path $BackendRoot "demos\demo-camel-executor"
        Health = "http://localhost:8081/api/executor/health"
    }
)

function Test-Health {
    param([string]$Url)
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3
        return $response.StatusCode -ge 200 -and $response.StatusCode -lt 500
    } catch {
        return $false
    }
}

function Wait-Health {
    param([hashtable]$Service, [int]$TimeoutSeconds = 180)
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if (Test-Health $Service.Health) {
            Write-Host "[real-stack] $($Service.Name) ready: $($Service.Health)" -ForegroundColor Green
            return
        }
        if ($Service.Process -and $Service.Process.HasExited) {
            throw "[real-stack] $($Service.Name) exited before its health check became ready"
        }
        Start-Sleep -Seconds 2
    }
    $logPath = Join-Path $artifactRoot "$($Service.Name).log"
    if (Test-Path $logPath) {
        Get-Content $logPath -Tail 80
    }
    throw "[real-stack] $($Service.Name) did not become ready within ${TimeoutSeconds}s"
}

$started = [System.Collections.Generic.List[System.Diagnostics.Process]]::new()
try {
    $requiresBackendBuild = $services | Where-Object { -not (Test-Health $_.Health) }
    if ($requiresBackendBuild) {
        Push-Location $BackendRoot
        try {
            & mvn `
                "-pl" "nebula-platform/platform-console,demos/demo-camel-console,demos/demo-camel-executor" `
                "-am" "install" "-DskipTests"
            if ($LASTEXITCODE -ne 0) {
                throw "[real-stack] backend reactor build failed"
            }
        } finally {
            Pop-Location
        }
    }

    foreach ($service in $services) {
        if (Test-Health $service.Health) {
            Write-Host "[real-stack] reusing $($service.Name)"
            continue
        }
        if (-not (Test-Path $service.Directory)) {
            throw "[real-stack] backend module not found: $($service.Directory)"
        }
        $logPath = Join-Path $artifactRoot "$($service.Name).log"
        $errorLogPath = Join-Path $artifactRoot "$($service.Name).error.log"
        $process = Start-Process -FilePath "mvn" `
            -ArgumentList "spring-boot:run", "-DskipTests" `
            -WorkingDirectory $service.Directory `
            -RedirectStandardOutput $logPath `
            -RedirectStandardError $errorLogPath `
            -WindowStyle Hidden `
            -PassThru
        $started.Add($process)
        $service.Process = $process
        Write-Host "[real-stack] starting $($service.Name), pid=$($process.Id)"
    }

    foreach ($service in $services) {
        Wait-Health $service
    }

    Push-Location $studioRoot
    try {
        & vp run generate:configs
        if ($LASTEXITCODE -ne 0) { throw "window config generation failed" }
        & vp run generate:contracts
        if ($LASTEXITCODE -ne 0) { throw "contract generation failed" }
        & git diff --exit-code -- `
            "packages/core/app-shell/src/common/_generated-windows.ts" `
            "packages/contracts/generated/openapi.json" `
            "packages/contracts/generated/platform-api.ts" `
            "packages/contracts/generated/index.ts"
        if ($LASTEXITCODE -ne 0) {
            throw "live backend contracts differ from checked-in generated contracts"
        }
        & vp exec playwright test --project=real-stack
        if ($LASTEXITCODE -ne 0) { throw "real-stack Playwright project failed" }
    } finally {
        Pop-Location
    }
} catch {
    Write-Host $_ -ForegroundColor Red
    foreach ($service in $services) {
        $logPath = Join-Path $artifactRoot "$($service.Name).log"
        $errorLogPath = Join-Path $artifactRoot "$($service.Name).error.log"
        if (Test-Path $logPath) {
            Write-Host "`n--- $($service.Name) ---"
            Get-Content $logPath -Tail 60
        }
        if (Test-Path $errorLogPath) {
            Get-Content $errorLogPath -Tail 30
        }
    }
    exit 1
} finally {
    if (-not $KeepServices) {
        foreach ($process in $started) {
            if (-not $process.HasExited) {
                & taskkill /PID $process.Id /T /F 2>$null | Out-Null
                if (-not $process.HasExited) {
                    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
                }
            }
        }
    }
}
