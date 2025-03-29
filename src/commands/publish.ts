import { CommandFactory } from ".";
import * as vscode from "vscode";
import { publishCommand } from "../core/uniapp/command";
import { getUniappConfig } from "../context";
import { UnappRunConfig, UniappRuntimeArgs, runtimeArgs } from "../core/uniapp";
import path = require("path");

export const publish: CommandFactory = (
  ctx: vscode.ExtensionContext,
  logger: vscode.LogOutputChannel
) => {
  return async () => {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders) {
      vscode.window.showErrorMessage("获取工作目录失败");
      return;
    }
    let currentWorkspace = folders[0];
    if (folders.length > 1) {
      const selectedName = await vscode.window.showQuickPick(
        folders.map((item) => item.name),
        {
          placeHolder: "请选择要编译运行的工作目录",
        }
      );
      if (!selectedName) {
        return;
      }
      currentWorkspace = folders.find((item) => item.name === selectedName);
    }
    // 获取 launch.json 配置
    const config = vscode.workspace.getConfiguration(
      "launch",
      currentWorkspace.uri
    );

    const configurations: Array<any> = config.get("configurations") ?? [];
    //过滤type=uniapp-run
    const uniappRunConfigurations =
      configurations.filter((item: any) => item.type === "uniapp-run") || [];
    let defaultConfig = configurations[0];
    // 如果有多个配置，让用户选择
    if (uniappRunConfigurations.length > 1) {
      const res = await vscode.window.showQuickPick(
        uniappRunConfigurations.map((item: any) => item.name),
        {
          placeHolder: "请选择要编译运行的配置",
        }
      );
      defaultConfig = uniappRunConfigurations.find(
        (item: any) => item.name === res
      );
    }

    if (!defaultConfig) {
      vscode.window.showErrorMessage("没有找到配置");
      return;
    }
    const conf: UnappRunConfig = getUniappConfig();
    if (!conf) {
      //  打开设置
      vscode.window.
        showErrorMessage('请设置HBuilderX路径', { modal: true }, { title: '打开设置' })
        .then((item) => {
          if (item) {
            vscode.commands.executeCommand('workbench.action.openSettings', '@ext:hb0730.uniapp-run');
          }
        });
      
      return;
    }
    const args: runtimeArgs = {
      // 规范化路径 windows/mac/linux 通用
      workPath: path.normalize(
        defaultConfig.src || currentWorkspace.uri.fsPath
      ),
      name: currentWorkspace.name,
      platform: defaultConfig.platform,
      compress: defaultConfig.compress,
      openDevTools: defaultConfig.openDevTool,
      production: true,
      uniVueVersion: defaultConfig.vueVersion,
    };
    publishCommand(new UniappRuntimeArgs(args, conf), logger);
  };
};
