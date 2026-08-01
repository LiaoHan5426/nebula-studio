. (Join-Path $PSScriptRoot "run-real-stack.ps1") -SkipExecution

Describe "run-real-stack process ownership" {
    It "does not capture the listener PID for a reused service" {
        Mock Test-Health { $true }
        Mock Get-NetTCPConnection { [pscustomobject]@{ OwningProcess = 4242 } }
        $service = @{
            Name = "reused-service"
            Health = "http://localhost:8090/actuator/health"
        }

        Wait-Health -Service $service -TimeoutSeconds 1

        $service.ContainsKey("ListenerPid") | Should Be $false
        Assert-MockCalled Get-NetTCPConnection -Times 0
    }

    It "never treats a reused service listener as owned" {
        $service = @{ Name = "reused-service" }

        (Test-OwnedListener -Service $service -ListenerPid 4242) | Should Be $false
    }

    It "tree-kills the launcher when startup fails before a listener is captured" {
        Mock Update-OwnedProcessTree {}
        Mock Stop-ProcessTree {}
        $launcher = @{ ProcessId = 4343; CreationDate = [datetime]"2026-08-01T00:00:00Z" }
        $service = @{
            Name = "failed-service"
            StartedByRun = $true
            Process = [pscustomobject]@{ Id = 4343 }
            LauncherIdentity = $launcher
            OwnedProcessIdentities = @{ 4343 = $launcher }
        }

        Stop-StartedService -Service $service

        Assert-MockCalled Stop-ProcessTree -Times 1 -ParameterFilter { $Identity.ProcessId -eq 4343 }
    }

    It "cleans a recorded descendant after its launcher has exited" {
        Mock Update-OwnedProcessTree {}
        Mock Stop-ProcessTree {}
        $launcher = @{ ProcessId = 4343; CreationDate = [datetime]"2026-08-01T00:00:00Z" }
        $child = @{ ProcessId = 4444; CreationDate = [datetime]"2026-08-01T00:00:01Z" }
        $service = @{
            Name = "failed-service"
            StartedByRun = $true
            Process = [pscustomobject]@{ Id = 4343 }
            LauncherIdentity = $launcher
            OwnedProcessIdentities = @{ 4343 = $launcher; 4444 = $child }
        }

        Stop-StartedService -Service $service

        Assert-MockCalled Stop-ProcessTree -Times 1 -ParameterFilter { $Identity.ProcessId -eq 4444 }
    }

    It "does not kill a reused process ID" {
        Mock Get-ProcessIdentity {
            @{ ProcessId = 4343; CreationDate = [datetime]"2026-08-01T00:01:00Z" }
        }
        Mock taskkill {}
        $original = @{ ProcessId = 4343; CreationDate = [datetime]"2026-08-01T00:00:00Z" }

        Stop-ProcessTree -Identity $original

        Assert-MockCalled taskkill -Times 0
    }

    It "does not trust a listener when the launcher PID was reused" {
        Mock Test-ProcessIdentity { $false }
        Mock Get-CimInstance { throw "ancestry must not be inspected for a stale launcher identity" }
        $service = @{
            Process = [pscustomobject]@{ Id = 4343 }
            LauncherIdentity = @{ ProcessId = 4343; CreationDate = [datetime]"2026-08-01T00:00:00Z" }
        }

        (Test-OwnedListener -Service $service -ListenerPid 4444) | Should Be $false

        Assert-MockCalled Get-CimInstance -Times 0
    }

    It "does not trust listener ancestry older than the launcher" {
        Mock Test-ProcessIdentity { $true }
        Mock Get-CimInstance {
            [pscustomobject]@{
                ProcessId = 4444
                ParentProcessId = 4343
                CreationDate = [datetime]"2026-08-01T00:00:00Z"
            }
        }
        $service = @{
            LauncherIdentity = @{
                ProcessId = 4343
                CreationDate = [datetime]"2026-08-01T00:01:00Z"
            }
        }

        (Test-OwnedListener -Service $service -ListenerPid 4444) | Should Be $false
    }

    It "does not record descendants older than their verified parent" {
        Mock Test-ProcessIdentity { $true }
        Mock Get-CimInstance {
            @([pscustomobject]@{
                ProcessId = 4444
                ParentProcessId = 4343
                CreationDate = [datetime]"2026-08-01T00:00:00Z"
            })
        }
        $launcher = @{
            ProcessId = 4343
            CreationDate = [datetime]"2026-08-01T00:01:00Z"
        }

        @(Get-DescendantProcessIdentities -Identity $launcher).Count | Should Be 0
    }

    It "continues cleanup after one service fails" {
        Mock Stop-StartedService {
            if ($Service.Name -eq "first") { throw "stuck" }
        }
        $errors = @(Stop-StartedServices -Services @(
            @{ Name = "first" },
            @{ Name = "second" }
        ))

        $errors.Count | Should Be 1
        Assert-MockCalled Stop-StartedService -Times 1 -ParameterFilter { $Service.Name -eq "second" }
    }
}
