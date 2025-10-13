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
  protected os: 'mac' | 'win'| 'linux';
  constructor(public conf: DevToolConfig, public log: vscode.LogOutputChannel) {
    // this.isWin = process.platform === "win32";
    // process.platform 有以下几种可能： 'aix' | 'darwin' | 'freebsd' | 'linux' | 'openbsd' | 'sunos' | 'win32' | 'cygwin'
    if (process.platform === "darwin") {
      this.os = 'mac';
    } else if (process.platform === "win32") {
      this.os = 'win';
    } else {
      this.os = 'linux';
    }
  }
  /**
   * 执行打开工具
   * @param projectPath 项目路径
   */
  abstract exec(projectPath: string): void;
}
