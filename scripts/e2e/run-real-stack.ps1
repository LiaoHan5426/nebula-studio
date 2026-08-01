[CmdletBinding()]
param(
    [string]$BackendRoot = "",
    [switch]$KeepServices,
    [switch]$SkipExecution
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
        Health = "http://localhost:8090/actuator/health"
    },
    @{
        Name = "platform-integration"
        Directory = Join-Path $BackendRoot "nebula-platform\platform-integration"
        Health = "http://localhost:8080/actuator/health"
    },
    @{
        Name = "platform-integration-executor"
        Directory = Join-Path $BackendRoot "nebula-platform\platform-integration-executor"
        Health = "http://localhost:8081/actuator/health"
    }
)

function Test-Health {
    param([string]$Url)
    try {
        $payload = Invoke-RestMethod -Uri $Url -TimeoutSec 3
        if ($null -ne $payload.status) {
            return $payload.status -eq "UP"
        }
        if ($null -ne $payload.success) {
            return $payload.success -eq $true
        }
        return $true
    } catch {
        return $false
    }
}

function Assert-Unauthorized {
    param([string]$Url)
    try {
        Invoke-WebRequest -Uri $Url -TimeoutSec 5 -UseBasicParsing | Out-Null
    } catch {
        $statusCode = [int]$_.Exception.Response.StatusCode
        if ($statusCode -eq 401) {
            Write-Host "[real-stack] unauthenticated access rejected: $Url" -ForegroundColor Green
            return
        }
        throw "[real-stack] expected HTTP 401 from $Url, received $statusCode"
    }
    throw "[real-stack] expected HTTP 401 from $Url, request unexpectedly succeeded"
}

function Wait-Health {
    param([hashtable]$Service, [int]$TimeoutSeconds = 180)
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if (Test-Health $Service.Health) {
            if ($Service.StartedByRun) {
                $port = ([uri]$Service.Health).Port
                $listener = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
                    Select-Object -First 1
                if ($listener -and (Test-OwnedListener -Service $Service -ListenerPid $listener.OwningProcess)) {
                    $Service.ListenerPid = $listener.OwningProcess
                } elseif ($listener) {
                    throw "[real-stack] $($Service.Name) listener is not owned by this run: pid=$($listener.OwningProcess)"
                }
            }
            Write-Host "[real-stack] $($Service.Name) ready: $($Service.Health)" -ForegroundColor Green
            return
        }
        Start-Sleep -Seconds 2
    }
    $logPath = Join-Path $artifactRoot "$($Service.Name).log"
    if (Test-Path $logPath) {
        Get-Content $logPath -Tail 80
    }
    throw "[real-stack] $($Service.Name) did not become ready within ${TimeoutSeconds}s"
}

function Test-OwnedListener {
    param([hashtable]$Service, [int]$ListenerPid)
    if (-not $Service.StartedByRun -or -not $Service.Process) {
        return $false
    }

    $launcherPid = $Service.Process.Id
    $currentPid = $ListenerPid
    while ($currentPid -gt 0) {
        if ($currentPid -eq $launcherPid) {
            return $true
        }
        $current = Get-CimInstance Win32_Process -Filter "ProcessId = $currentPid" -ErrorAction SilentlyContinue
        if (-not $current) {
            return $false
        }
        if ($current.ParentProcessId -eq $launcherPid) {
            return $true
        }
        $currentPid = $current.ParentProcessId
    }
    return $false
}

function Get-DescendantProcessIds {
    param([int]$ProcessId)
    $processes = @(Get-CimInstance Win32_Process -ErrorAction SilentlyContinue)
    $pending = [System.Collections.Generic.Queue[int]]::new()
    $pending.Enqueue($ProcessId)
    $descendants = [System.Collections.Generic.List[int]]::new()
    while ($pending.Count -gt 0) {
        $parentId = $pending.Dequeue()
        foreach ($child in $processes | Where-Object { $_.ParentProcessId -eq $parentId }) {
            $childId = [int]$child.ProcessId
            $descendants.Add($childId)
            $pending.Enqueue($childId)
        }
    }
    return $descendants.ToArray()
}

function Stop-ProcessTree {
    param([int]$ProcessId)
    if (-not (Get-Process -Id $ProcessId -ErrorAction SilentlyContinue)) {
        return
    }
    $processIds = @($ProcessId) + @(Get-DescendantProcessIds -ProcessId $ProcessId)
    & taskkill /PID $ProcessId /T /F 2>$null | Out-Null
    $deadline = [DateTime]::UtcNow.AddSeconds(15)
    do {
        $remaining = @($processIds | Where-Object { Get-Process -Id $_ -ErrorAction SilentlyContinue })
        if ($remaining.Count -eq 0) {
            return
        }
        Start-Sleep -Milliseconds 200
    } while ([DateTime]::UtcNow -lt $deadline)
    if ($remaining.Count -gt 0) {
        throw "[real-stack] process tree still running after cleanup deadline: pids=$($remaining -join ',')"
    }
}

function Stop-StartedService {
    param([hashtable]$Service)
    if (-not $Service.StartedByRun -or -not $Service.Process) {
        return
    }
    $listenerOwned = $Service.ListenerPid -and
        (Test-OwnedListener -Service $Service -ListenerPid $Service.ListenerPid)
    if ($Service.ListenerPid -and -not $listenerOwned) {
        Write-Warning "[real-stack] skipped unowned listener during cleanup: pid=$($Service.ListenerPid)"
    }
    Stop-ProcessTree -ProcessId $Service.Process.Id
    if ($listenerOwned -and (Get-Process -Id $Service.ListenerPid -ErrorAction SilentlyContinue)) {
        Stop-ProcessTree -ProcessId $Service.ListenerPid
    }
}

if ($SkipExecution) {
    return
}

if (-not $env:NEBULA_E2E_PASSWORD -or -not $env:NEBULA_E2E_GATEWAY_API_KEY) {
    throw "[real-stack] NEBULA_E2E_PASSWORD and NEBULA_E2E_GATEWAY_API_KEY must be supplied via the environment"
}

try {
    $requiresBackendBuild = $services | Where-Object { -not (Test-Health $_.Health) }
    if ($requiresBackendBuild) {
        Push-Location $BackendRoot
        try {
            & mvn.cmd `
                "-pl" "nebula-platform/platform-console,nebula-platform/platform-integration,nebula-platform/platform-integration-executor" `
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
        $process = Start-Process -FilePath "mvn.cmd" `
            -ArgumentList "spring-boot:run", "-DskipTests" `
            -WorkingDirectory $service.Directory `
            -RedirectStandardOutput $logPath `
            -RedirectStandardError $errorLogPath `
            -WindowStyle Hidden `
            -PassThru
        $service.Process = $process
        $service.StartedByRun = $true
        Write-Host "[real-stack] starting $($service.Name), pid=$($process.Id)"
    }

    foreach ($service in $services) {
        Wait-Health $service
    }
    Assert-Unauthorized "http://localhost:8090/monitor/api/metrics"

    Push-Location $studioRoot
    try {
        & vp run generate:configs
        if ($LASTEXITCODE -ne 0) { throw "window config generation failed" }
        & vp run generate:contracts:strict
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
        foreach ($service in $services) {
            Stop-StartedService -Service $service
        }
    }
}
