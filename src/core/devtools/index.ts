import * as vscode from "vscode";
/**
 * 支持打开开发者工具的编译平台
 */
export enum OpenDevToolPlatform {
  weixin = "mp-weixin",
}

export interface DevToolConfig {
  /**
   * 开发者工具所在地址
   */
  path: string;

  [key: string]: string;
}

export abstract class OpenDevTool {
  protected isWin: boolean;
  constructor(public conf: DevToolConfig, public log: vscode.LogOutputChannel) {
    this.isWin = process.platform === "win32";
  }
  /**
   * 执行打开工具
   * @param projectPath 项目路径
   */
  abstract exec(projectPath: string): void;
}
