import * as child_process from "child_process";
import { Config, OpenDevTools } from ".";
import { existsSync } from "fs";
import { logger } from "@vscode/debugadapter";
import { DebugRuntime } from "../debugger/debugRuntime";

/**
 * 微信开发者工具
 */
export class WxDevtool extends OpenDevTools {
  constructor(config: Config) {
    super(config);
  }
  exec(projectPath: string, runtime?: DebugRuntime): void {
    const _devToolPath = this.devToolPath();
    if (!existsSync(_devToolPath)) {
      logger.warn(`${_devToolPath} 目录不存在，跳过打开开发者工具`);
      return;
    }
    let cmd = `"${this.devToolPath()}" open  --project "${projectPath}"`;
    if (this.isWin) {
      child_process.execSync("chcp 65001");
    }
    const _devProcess = child_process.exec(cmd, (err, stdout, stderr) => {
      if (err) {
        runtime?.sendEvent("data", err.stack + "\n");
      }
      if (stdout) {
        runtime?.sendEvent("stdout", stdout+"\n");
      }
      if (stderr) {
        runtime?.sendEvent("stderr", stderr);
      }
    });
  }

  private devToolPath(): string {
    let _devToolPath =
      this.devToolsPath + (this.isWin ? `/cli.bat` : `Contents/MacOS/cli`);

    if (!existsSync(_devToolPath)) {
      _devToolPath = this.defaultDevToolPath;
    }
    return _devToolPath;
  }

  private get defaultDevToolPath() {
    if (this.isWin) {
      return "C:/Program Files (x86)/Tencent/微信web开发者工具/cli.bat";
    } else {
      return "/Applications/wechatwebdevtools.app/Contents/MacOS/cli";
    }
  }
}
