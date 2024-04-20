import { CommandFactory } from ".";
import * as vscode from "vscode";

export const run: CommandFactory = () => {
  return async (conf: string | vscode.DebugConfiguration) => {
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
      currentWorkspace = folders.find((item) => item.name === selectedName)[0];
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

    vscode.debug.startDebugging(currentWorkspace, defaultConfig);
  };
};
