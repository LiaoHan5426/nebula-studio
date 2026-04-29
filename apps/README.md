# 目录结构

## 简单目录结构

这个简单目录结构示例，其中electron文件夹是electron应用的代码，app1、app2等文件夹是不同的应用的代码，他们可以作为独立应用运行启动，也可以被electron应用加载运行。当前目录结构展示的是app1、app2等作为窗口，使用统一的preload设置，electron应用作为主进程来管理这些窗口的生命周期和通信。

```bash
apps
├── README.md
├── electron
│   ├── src
│   │   ├── main.ts
│   │   └── preload.ts
│   └── package.json
├── app1
│   ├── src
│   │   ├── App.vue
│   │   └── main.ts
│   ├── index.html
│   └── package.json
├── app2
│   ├── src
│   │   ├── App.vue
│   │   └── main.ts
│   ├── index.html
│   └── package.json
└── ... (other apps)
```

## 预期目标结构

这个预期目标结构示例，其中electron文件夹是electron应用的代码，preload文件夹是预加载脚本的代码，app1、app2等文件夹是不同的应用的代码，他们可以作为独立应用运行启动，也可以被electron应用加载运行。当前目录结构展示的是app1、app2等作为窗口，使用不同的preload设置，electron应用作为主进程来管理这些窗口的生命周期和通信。

```bash
apps
├── README.md
├── electron
│   ├── src
│   │   ├── main.ts
│   │   └── preload.ts
│   └── package.json
├── preload
│   ├── app1
│   │   ├── src
│   │   │   ├── ...
│   │   │   └── index.ts
│   │   └── package.json
│   ├── app2
│   │   ├── src
│   │   │   ├── ...
│   │   │   └── index.ts
│   │   └── package.json
│   └── ... (other apps)
├── app1
│   ├── src
│   │   ├── App.vue
│   │   └── main.ts
│   ├── index.html
│   └── package.json
├── app2
│   ├── src
│   │   ├── App.vue
│   │   └── main.ts
│   ├── index.html
│   └── package.json
└── ... (other apps)
```

优化调整需求：1、当前代码存在问题，开发阶段electron应用可以加载website(对应app1、app2等)的代码进行开发调试，但在构建阶段，electron应用与website的代码是分离的，electron应用没有加载website的代码进行构建，而是预期加载electron下的www/index.html进行构建，导致与预期不符2、当前代码的preload似乎无法满足按窗口加载不同的preload脚本的需求，预期目标结构中将preload脚本单独放在preload文件夹下，并且每个应用有自己独立的preload脚本，这样可以更灵活地管理不同窗口的preload设置。
