// 主窗口为直接加载
// 其他窗口的展现形式：弹出新窗口、与主窗口通过tab页切换等，后续根据需求增加
export default {
  // 指定electron和preload的目录名称
  dirs: {
    // electron启动模块所在的目录名称，默认为'electron'
    electron: 'electron',
    // electron预加载模块所在的目录名称，默认为'electron-preload'
    // 齐下有子包，子包名称与windows中的属性名相同，对应表示各个独立窗口的预加载模块所在的目录名称
    preload: 'electron-preload',
  },
  // 窗口配置，属性名为windows目录下的子包名称，属性值为该窗口的配置项
  windows: {
    // 主窗口的配置项，属性名为'main'，属性值为该窗口对应的前端应用的目录名称，默认为'frontend'
    main: 'frontend',
  },
  build: {
    appName: 'NebulaStudio',
    appVersion: '0.0.1',
    appBuildNumber: 1,
    apiVersion: '0.0.1',
  },
};
