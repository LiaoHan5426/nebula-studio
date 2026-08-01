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
        if ($Service.StartedByRun) {
            Update-OwnedProcessTree -Service $Service
        }
        if (Test-Health $Service.Health) {
            if ($Service.StartedByRun) {
                $port = ([uri]$Service.Health).Port
                $listener = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
                    Select-Object -First 1
                if ($listener -and (Test-OwnedListener -Service $Service -ListenerPid $listener.OwningProcess)) {
                    $Service.ListenerPid = $listener.OwningProcess
                    $listenerIdentity = Get-ProcessIdentity -ProcessId $listener.OwningProcess
                    if ($listenerIdentity) {
                        $Service.OwnedProcessIdentities[$listener.OwningProcess] = $listenerIdentity
                    }
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
    if (-not $Service.LauncherIdentity -or -not (Test-ProcessIdentity -Identity $Service.LauncherIdentity)) {
        return $false
    }
    $launcherPid = $Service.LauncherIdentity.ProcessId
    $currentPid = $ListenerPid
    $childCreationDate = $null
    while ($currentPid -gt 0) {
        if ($currentPid -eq $launcherPid) {
            return -not $childCreationDate -or
                $childCreationDate -ge $Service.LauncherIdentity.CreationDate
        }
        $current = Get-CimInstance Win32_Process -Filter "ProcessId = $currentPid" -ErrorAction SilentlyContinue
        if (-not $current) {
            return $false
        }
        $currentCreationDate = [datetime]$current.CreationDate
        if ($currentCreationDate -lt $Service.LauncherIdentity.CreationDate -or
            ($childCreationDate -and $childCreationDate -lt $currentCreationDate)) {
            return $false
        }
        $childCreationDate = $currentCreationDate
        $currentPid = $current.ParentProcessId
    }
    return $false
}

function Get-ProcessIdentity {
    param([int]$ProcessId)
    $process = Get-CimInstance Win32_Process -Filter "ProcessId = $ProcessId" -ErrorAction SilentlyContinue
    if (-not $process) {
        return $null
    }
    return @{
        ProcessId = [int]$process.ProcessId
        CreationDate = [datetime]$process.CreationDate
    }
}

function Test-ProcessIdentity {
    param([hashtable]$Identity)
    if (-not $Identity) {
        return $false
    }
    $current = Get-ProcessIdentity -ProcessId $Identity.ProcessId
    return $current -and $current.CreationDate -eq $Identity.CreationDate
}

function Get-DescendantProcessIdentities {
    param([hashtable]$Identity)
    if (-not (Test-ProcessIdentity -Identity $Identity)) {
        return @()
    }
    $processes = @(Get-CimInstance Win32_Process -ErrorAction SilentlyContinue)
    $pending = [System.Collections.Queue]::new()
    $pending.Enqueue($Identity)
    $visited = [System.Collections.Generic.HashSet[int]]::new()
    [void]$visited.Add($Identity.ProcessId)
    $descendants = [System.Collections.Generic.List[object]]::new()
    while ($pending.Count -gt 0) {
        $parentIdentity = $pending.Dequeue()
        foreach ($child in $processes | Where-Object { $_.ParentProcessId -eq $parentIdentity.ProcessId }) {
            $childId = [int]$child.ProcessId
            $childIdentity = @{
                ProcessId = $childId
                CreationDate = [datetime]$child.CreationDate
            }
            if ($childIdentity.CreationDate -lt $parentIdentity.CreationDate -or
                -not $visited.Add($childId)) {
                continue
            }
            $descendants.Add($childIdentity)
            $pending.Enqueue($childIdentity)
        }
    }
    return $descendants.ToArray()
}

function Update-OwnedProcessTree {
    param([hashtable]$Service)
    if (-not $Service.LauncherIdentity) {
        return
    }
    if (-not $Service.OwnedProcessIdentities) {
        $Service.OwnedProcessIdentities = @{}
    }
    if (-not (Test-ProcessIdentity -Identity $Service.LauncherIdentity)) {
        return
    }
    $Service.OwnedProcessIdentities[$Service.LauncherIdentity.ProcessId] = $Service.LauncherIdentity
    foreach ($identity in Get-DescendantProcessIdentities -Identity $Service.LauncherIdentity) {
        $Service.OwnedProcessIdentities[$identity.ProcessId] = $identity
    }
}

function Stop-ProcessTree {
    param([hashtable]$Identity)
    if (-not (Test-ProcessIdentity -Identity $Identity)) {
        return
    }
    $identities = @($Identity) + @(Get-DescendantProcessIdentities -Identity $Identity)
    & taskkill /PID $Identity.ProcessId /T /F 2>$null | Out-Null
    $deadline = [DateTime]::UtcNow.AddSeconds(15)
    do {
        $remaining = @($identities | Where-Object { Test-ProcessIdentity -Identity $_ })
        if ($remaining.Count -eq 0) {
            return
        }
        Start-Sleep -Milliseconds 200
    } while ([DateTime]::UtcNow -lt $deadline)
    if ($remaining.Count -gt 0) {
        $remainingPids = $remaining | ForEach-Object { $_.ProcessId }
        throw "[real-stack] process tree still running after cleanup deadline: pids=$($remainingPids -join ',')"
    }
}

function Stop-StartedService {
    param([hashtable]$Service)
    if (-not $Service.StartedByRun -or -not $Service.LauncherIdentity) {
        return
    }
    Update-OwnedProcessTree -Service $Service
    $listenerOwned = $Service.ListenerPid -and
        (Test-OwnedListener -Service $Service -ListenerPid $Service.ListenerPid)
    if ($Service.ListenerPid -and -not $listenerOwned) {
        Write-Warning "[real-stack] skipped unowned listener during cleanup: pid=$($Service.ListenerPid)"
    }
    if ($listenerOwned) {
        $listenerIdentity = Get-ProcessIdentity -ProcessId $Service.ListenerPid
        if ($listenerIdentity) {
            $Service.OwnedProcessIdentities[$listenerIdentity.ProcessId] = $listenerIdentity
        }
    }
    $identities = @($Service.LauncherIdentity) + @(
        $Service.OwnedProcessIdentities.Values |
            Where-Object { $_.ProcessId -ne $Service.LauncherIdentity.ProcessId }
    )
    foreach ($identity in $identities) {
        Stop-ProcessTree -Identity $identity
    }
}

function Stop-StartedServices {
    param([array]$Services)
    $errors = [System.Collections.Generic.List[object]]::new()
    foreach ($service in $Services) {
        try {
            Stop-StartedService -Service $service
        } catch {
            $errors.Add($_)
            Write-Warning "[real-stack] cleanup failed for $($service.Name): $($_.Exception.Message)"
        }
    }
    return $errors.ToArray()
}

if ($SkipExecution) {
    return
}

if (-not $env:NEBULA_E2E_PASSWORD -or -not $env:NEBULA_E2E_GATEWAY_API_KEY) {
    throw "[real-stack] NEBULA_E2E_PASSWORD and NEBULA_E2E_GATEWAY_API_KEY must be supplied via the environment"
}

$runError = $null
$cleanupErrors = @()
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
        $service.OwnedProcessIdentities = @{}
        $service.LauncherIdentity = Get-ProcessIdentity -ProcessId $process.Id
        if (-not $service.LauncherIdentity) {
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
            throw "[real-stack] unable to record launcher identity: pid=$($process.Id)"
        }
        Update-OwnedProcessTree -Service $service
        Write-Host "[real-stack] starting $($service.Name), pid=$($process.Id)"
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
    $runError = $_
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
} finally {
    if (-not $KeepServices) {
        $cleanupErrors = @(Stop-StartedServices -Services $services)
    }
}

if ($runError -or $cleanupErrors.Count -gt 0) {
    if ($cleanupErrors.Count -gt 0) {
        Write-Host "[real-stack] cleanup completed with $($cleanupErrors.Count) error(s)" -ForegroundColor Red
    }
    exit 1
}
