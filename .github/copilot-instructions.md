<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Prerequisites: Node.js >= 16.x, a supported package manager (`npm`, `pnpm`, or `yarn`), and `vp` installed. Verify by running `node -v`, `npm -v` (or `pnpm -v` / `yarn -v`), and `vp --version`.

Prefer the online docs at https://viteplus.dev/guide/ for the canonical source; local docs are a mirror at `node_modules/vite-plus/docs`.

## Review Checklist

1. Run `vp install` after pulling remote changes and before getting started. If `vp` is not available, run the project install first (`npm install` / `pnpm install` / `yarn install`) and then run `npx vp install` or `pnpm dlx vp install`. If `vp install` fails, include the full terminal output, your Node and package-manager versions, and the project's lockfile.
2. Inspect `vite.config.ts` for task definitions and `package.json` for scripts. If custom validation scripts exist, list them and run them explicitly, for example `vp run lint`, `vp run validate`, `vp run typecheck`, or other required commands before `vp check` or `vp test`.
3. Run `vp check` to format, lint, and type-check changes.
4. Run `vp test` to execute unit and integration tests.
5. If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

If `vp check` or `vp test` fail, include the full terminal output, the exact command used, `node -v`, your OS, the package manager used, the project's lockfile (`package-lock.json` / `pnpm-lock.yaml` / `yarn.lock`), and `vp env doctor` output when reporting issues.

<!--VITE PLUS END-->
