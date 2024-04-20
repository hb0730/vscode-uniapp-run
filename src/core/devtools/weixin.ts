import { existsSync } from "fs";
import { OpenDevTool } from ".";
import { exec, execSync } from "child_process";
import  * as path  from "path";

export class WxDevTool extends OpenDevTool {
  exec(projectPath: string): void {
    const path = this.conf.path;
    // 开发者工具与项目路径是否非法or存在
    if (!existsSync(path) || !existsSync(projectPath)) {
      this.log.error(
        `path:${path} or projectPath:${projectPath} is not exists`
      );
      return;
    }
    // 解决路径空格问题
    const cmd = `"${this.toolPath()}" open --project "${projectPath}"`;
    if (this.isWin) {
      execSync("chcp 65001");
    }
    this.log.info(`exec ${cmd}`);

    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        this.log.error(err.stack);
      }
      if (stdout) {
        this.log.info(stdout);
      }
      if (stderr) {
        this.log.error(stderr);
      }
    });
  }

  private toolPath(): string {
    return path.join(
      this.conf.path,
      this.isWin ? `/cli.bat` : `/Contents/MacOS/cli`
    );
  }
}
