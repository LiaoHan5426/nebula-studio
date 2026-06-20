---
name: powershell-shell-workflow
description: >-
  Runs shell commands correctly on Windows PowerShell: use semicolon chaining instead of &&, start long-running processes (Java, dev servers) in background, and avoid bash-only syntax. Use when the shell is PowerShell, OS is Windows, running terminal commands, starting mvn/spring-boot:run, vp dev servers, or chaining multiple commands.
---

# PowerShell / Windows shell workflow

Default shell on this machine is **PowerShell**. Do not paste bash-only command chains or assume Unix tooling.

## Command chaining

**Use `;` to chain commands — not `&&`.**

PowerShell 5.x does not support `&&` / `||`. Even on PowerShell 7+, prefer `;` here for consistency.

```powershell
# Wrong (bash / cmd habit)
rtk git add . && rtk git commit -m "msg" && rtk git push

# Correct
rtk git add . ; rtk git commit -m "msg" ; rtk git push
```

When a later step must run **only if the previous succeeded**, check exit code explicitly:

```powershell
rtk git add . ; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
rtk git commit -m "msg" ; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
rtk git push
```

RTK prefix from project rules still applies; only the chain operator changes.

## Piping and output capture (Cursor agent shell)

**Do not pipe long-running commands through `Select-Object -Last` / `-First`.**

PowerShell must read the **entire** upstream stream before `-Last N` can emit anything. In Cursor's Shell tool, a build or test run then shows **no output** until the process exits — and may background with an empty capture if `block_until_ms` is too short. This affects `vp run build`, `mvn`, `vp check`, etc.

```powershell
# Wrong in agent shell — often zero visible output
vp run build 2>&1 | Select-Object -Last 25

# Correct — plain command; use rtk for compact output; set block_until_ms high enough
rtk vp run build

# Tail only after completion — read terminal log, or:
Get-Content .build.log -Tail 25
```

For `vp`-specific timeouts and `block_until_ms` hints, see `agent-skills/skills/vite-plus-workflow/SKILL.md`.

## Long-running processes (background by default)

**Do not run blocking foreground commands for servers or apps that stay up until stopped.**

If the agent waits for the process to exit, the session hangs after a successful startup because these processes never emit a normal exit signal.

| Process type | Examples | Agent approach |
| --- | --- | --- |
| Java / Spring Boot | `mvn spring-boot:run`, `java -jar app.jar` | Shell tool: `block_until_ms: 0` (background) |
| Frontend dev servers | `vp run dev:web`, `vp dev`, `vite` | Same — background |
| Watch / poll loops | `vp test --watch`, tail -f equivalents | Background unless user asked to wait for output |

**Shell tool (preferred):** set `block_until_ms: 0` and use `working_directory` when needed. Poll terminal output or run a follow-up health check (`curl.exe`, log grep) instead of blocking on the server process.

**PowerShell `Start-Process` (when composing a one-liner in shell):**

```powershell
Start-Process -NoNewWindow -WorkingDirectory "F:\1-back\nebula\demos\demo-camel-console" `
  -FilePath "mvn" -ArgumentList "spring-boot:run","-DskipTests"
```

Start console (`:8080`) and executor (`:8081`) as **separate background** jobs from their module directories — not chained with `;` in one blocking invocation.

## Bash → PowerShell quick reference

| Bash / sh | PowerShell |
| --- | --- |
| `&&` / `\|\|` | `;` or `if ($LASTEXITCODE -eq 0) { ... }` |
| `export VAR=val` | `$env:VAR = "val"` |
| `$VAR` (env) | `$env:VAR` |
| `curl` | **`curl.exe`** (PowerShell `curl` is `Invoke-WebRequest`) |
| `/dev/null` | `$null` or `\| Out-Null` |
| `2>/dev/null` | `2>$null` |
| `mkdir -p dir` | `New-Item -ItemType Directory -Force -Path dir` |
| `rm -rf dir` | `Remove-Item -Recurse -Force dir` |
| `touch file` | `New-Item -ItemType File -Path file -Force` |
| `which cmd` | `Get-Command cmd` |
| `sleep 5` | `Start-Sleep -Seconds 5` |
| `grep pat file` | `rg pat file` or `Select-String -Path file -Pattern pat` |
| `tail -n 25 log` | **`Get-Content log -Tail 25`** after the command finishes — see below |
| `cmd \| tail -n 25` | **Do not** use `cmd 2>&1 \| Select-Object -Last 25` in agent shell |
| `cat file` | `Get-Content file` |
| `./script.sh` | `.\script.ps1` or invoke via Git Bash only if script is bash-only |
| `$(cat <<'EOF' ... EOF)` (heredoc) | Here-string: `@" ... "@` or pass `-m "message"` to git |

**Git commit message (PowerShell here-string):**

```powershell
git commit -m @"
feat: short summary

Optional body line.
"@
```

## Paths and quoting

- Prefer **absolute paths** on Windows (e.g. `F:\1-back\nebula\...`).
- Quote paths that contain spaces: `"F:\path with spaces\file"`.
- Forward slashes often work in .NET tooling; backslashes are fine in PowerShell strings.

## Maven / Java notes

- Run from the **demo module directory** (or `-f path/to/pom.xml`), not the parent POM alone.
- Example (background via agent Shell tool, not a single blocking line):
  1. `working_directory`: `F:\1-back\nebula\demos\demo-camel-console`, command: `mvn spring-boot:run -DskipTests`, `block_until_ms: 0`
  2. Same for `demo-camel-executor` on `:8081`

- Verify startup with `curl.exe http://localhost:8080/actuator/health` (or project-specific endpoint), not by waiting on `mvn` to exit.

## When to read this skill

- User info shows **Shell: powershell** or **OS: win32**
- Chaining two or more shell commands
- Starting backend, dev server, or any daemon-like process
- Translating bash snippets from docs or CI into local commands
