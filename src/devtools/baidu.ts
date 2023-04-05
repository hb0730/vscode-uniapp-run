import { existsSync } from "fs";
import { Config, OpenDevTools } from ".";
import { DebugRuntime } from "../debugger/debugRuntime";
import { logger } from "@vscode/debugadapter";
import * as child_process from "child_process";

/**
 * 百度开发者工具
 */
export class BaiduDevtool extends OpenDevTools {
  constructor(config: Config) {
    super(config);
  }
  exec(projectPath: string, runtime?: DebugRuntime): void {
    const _devToolPath = this.devToolPath;
    if (!existsSync(_devToolPath)) {
      logger.warn(`${_devToolPath} 目录不存在，跳过打开开发者工具`);
      return;
    }
    const cmd = `${_devToolPath} --project-path ${projectPath}`;
    if (this.isWin) {
      child_process.execSync("chcp 65001");
    }
    const _devProcess = child_process.exec(cmd, (err, stdout, stderr) => {
      if (err) {
        runtime?.sendEvent("data", err.stack + "\n");
      }
      if (stdout) {
        runtime?.sendEvent("stdout", stdout + "\n");
      }
      if (stderr) {
        runtime?.sendEvent("stderr", stderr);
      }
    });
  }

  private get devToolPath() {
    return (
      `${this.devToolsPath}` + (this.isWin ? `/cli` : `/Contents/MacOS/cli`)
    );
  }
}
