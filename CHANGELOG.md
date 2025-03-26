# Change Log

## 0.0.12
 * fix: 在Linux环境下导致`Error: spawn xxx\node\node ENOENT` [#53](https://github.com/hb0730/vscode-uniapp-run/issues/53)
   - 在`Windows/Linux`环境下，执行路径为`${HBuilderX}/plugins/` 
   - 在`Mac`环境下，执行路径为`${HBuilderX}/Contents/HBuilderX/plugins/`

### 0.0.11

* feat: 在`输出/output`面板显示自动聚焦`uniapp-run`的输出信息 [#52](https://github.com/hb0730/vscode-uniapp-run/pull/52)

### 0.0.10

* fix: 在`command`模式下，多个项目时，`currentWorkspace` 问题

### 0.0.9

* fix: 在不同的操作系统下当前工作路径问题
* fix: `child_process.exec` 空格路径问题

### 0.0.8

* fix `uniapp-run.publish` 命令时无法自动打开第三方开发者工具的bug

### 0.0.7

* 新增`uniapp-run.publish`和`uniapp-run.run` 命令

### 0.0.6

* 支持自定义项目路径`src`

### 0.0.5

* 新增对vue3的支持

## 0.0.4

* 新增百度开发者工具的打开 `测试中`
* 修复windows环境中打开微信开发者工具的bug

## 0.0.3

* 新增 打开`mp_weixin`开发者工具

## [Unreleased]

* Initial release
