# uniapp-run README

基于HBuilderX的采用uniapp-cli命令的方式，进行编译且可以自动打开第三方开发者工具的VS Code插件

本项目适用于没有采用CLI命令的uniapp项目，原需要HBuilderX进行编译的

![video](./images/video.gif)

# 配置

## 开发者工具&HBuilderX配置

![devTools](./images/devTools.png)

## launch.json 配置

如果第一次使用可以使用默认模版方式快速创建`launch.json`
![launchJson](./images/launchJson.png)

`launch.json` 参数

```json
{
    "type": "uniapp-run",
    "request": "launch",
    "name": "Uniapp Run",
    "platform": "mp-weixin"
}
```

* `type`: 必须是 `uniapp-run`
* `request`: 必须是: `launch`
* `name`: 随便填写
* `platform`: 编译成的平台，与uniapp基本保持一致: `mp-weixin`,`mp-alipay`,`mp-baidu`等
* `compress`: 是否运行时压缩
* `openDevTool`: 是否自动打开第三方开发者工具
