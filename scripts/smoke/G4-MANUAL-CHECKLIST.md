# G4 手动冒烟检查清单

> 执行前需启动：platform-console (8090) + camel-console (8080) + executor (8081) 自动化部分：`powershell -File scripts/smoke/g4-smoke.ps1`

---

## Task 1: Settings 全流程

| # | 步骤 | 期望结果 | 通过 |
| --- | --- | --- | --- |
| 1.1 | `vp run dev:web` + platform 8090 + camel 8080 | 启动无报错 | [ ] |
| 1.2 | 登录 → 打开 settings iframe | session 正常 | [ ] |
| 1.3 | 用户/角色/组织页 CRUD | 请求走 `/api/system` → 8090 | [ ] |
| 1.4 | 配置管理页 `/config` CRUD | CRUD 可达 8090 `/api/config` | [ ] |

## Task 2: Integration 发布流

| # | 步骤 | 期望结果 | 通过 |
| --- | --- | --- | --- |
| 2.1 | 三服务联跑（8090 + 8080 + 8081） | 全部可达 | [ ] |
| 2.2 | integration 发布流（Draft → Approve → Deploy） | 不回退至旧 proxy | [ ] |
| 2.3 | 任务调度页 `/tasks` CRUD + 触发 | `/api/task` → 8090 | [ ] |
| 2.4 | 订阅页 SSE 连接 | camel 8080 `/api/subscribe/camel` | [ ] |

## Task 3: Login + Auth 不回退

| #   | 检查项                 | 期望结果            | 通过 |
| --- | ---------------------- | ------------------- | ---- |
| 3.1 | `POST /api/auth/login` | 仍走 8080 proxy     | [ ]  |
| 3.2 | 401 → 重登             | authGuard 正常      | [ ]  |
| 3.3 | switch-org             | cookie/session 不断 | [ ]  |

---

## 执行记录

| 日期 | 执行人 | 结果 | 备注 |
| ---- | ------ | ---- | ---- |
|      |        |      |      |
