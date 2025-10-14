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
    if (this.os==='win') {
      // 解决中文乱码问题
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
    // 不同系统下，开发者工具的可执行文件路径不一样,需要判断
    if(this.os==='win'){
      return path.join(this.conf.path, `/cli.bat`);
    }else if(this.os==='mac'){
      return path.join(this.conf.path, `/Contents/MacOS/cli`);
    }else{
      return path.join(this.conf.path, `/bin/wechat-devtools-cli`);
    }
  }
}
