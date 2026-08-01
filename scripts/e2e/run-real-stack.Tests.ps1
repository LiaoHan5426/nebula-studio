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
}
