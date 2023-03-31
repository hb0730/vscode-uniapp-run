import { EventEmitter } from "events";
import { LaunchRequestArguments } from "./debugSession";
import * as childProcess from "child_process";
import { logger } from "@vscode/debugadapter";
import  * as path from "path";

//cd /Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/ NODE_ENV=development UNI_INPUT_DIR=/Users/hb0730/development/wave/m3/wave-m3-wechat UNI_OUTPUT_DIR=/Users/hb0730/development/wave/m3/wave-m3-wechat/dist UNI_PLATFORM=mp-weixin  /Applications/HBuilderX.app/Contents/HBuilderX/plugins/node/node --max-old-space-size=2048 /Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/bin/uniapp-cli.js

export class DebugRuntime extends EventEmitter {
  private _uniappProcess?: childProcess.ChildProcess;
  public _project?: Project;

  /**
   * 发送初始化请求
   */
  public async start(args: LaunchRequestArguments): Promise<void> {
    const _arg = new ArgsProject(args);
    logger.log("uniapp run start ............");
    logger.log(`HBuilderX node:  ${this._project?.node}`);
    logger.log(`cwd: ${this._project!.cwd}`);
    logger.log(`node env:  ${JSON.stringify(_arg.env())}`);
    const script = childProcess.spawn(
      this._project!.node,
      ["--max-old-space-size=2048", "bin/uniapp-cli.js"],
      {
        cwd: this._project!.cwd,
        env: _arg.env(),
      }
    );
    script.stdout.on("data", (data: Buffer) => {
      this.sendEvent("stdout", data.toString());
    });
    script.stderr.on("data", (data: Buffer) => {
      this.sendEvent("stderr", data.toString());
    });
    // script.on("exit", (code: number | null) => {
    //   this.sendEvent("exit", code ?? 0);
    //   this.sendEvent("end");
    // });
    script.on("error", (error: Error) => {
      this.sendEvent("data", error.stack + "\n");
    });
    this._uniappProcess=script;
  }
  /**
   * 通知Debugger停止运行
   */
  public async stopRun() {
    logger.log("uniapp run process stop ....");
    this._uniappProcess?.kill();
  }

  private sendEvent(event: string, ...args: any[]): void {
    setTimeout(() => {
      this.emit(event, ...args);
    }, 0);
  }
}

export class Project {
  private isWindows: boolean;

  /**
   * HBuilderX 安装路径
   *
   */
  private _localInstall: string;

  constructor(isWindows: boolean, installLocalPath: string) {
    this.isWindows = isWindows;
    // 路径分割符问题
    this._localInstall = installLocalPath;
  }

  // /**
  //  * 微信开发者工具路径
  //  */
  // set wxDevtools(wxDevtools:string|undefined){
  // 	if(wxDevtools){
  // 		this._wxDevtools=wxDevtools;
  // 	}
  // }

  get node(): string {
    let paths: string[] = ["plugins", "node", "node"];
    if (!this.isWindows) {
      paths = ["Contents", "HBuilderX", ...paths];
    }
    return path.join(this._localInstall, ...paths);
  }

  get cwd(): string {
    let paths: string[] = ["plugins", "uniapp-cli"];
    if (!this.isWindows) {
      paths = ["Contents", "HBuilderX", ...paths];
    }
    return path.join(this._localInstall, ...paths);
  }
}

export class ArgsProject {
  /**
   *
   */
  private _workPath: string;
  /**
   * 项目名称
   */
  private _name: string;
  /**
   * 平台, mp-weixin,mp-ali,mp-qq
   */
  private _platform: string;
  /**
   * 是否运行时压缩
   */
  private _compress: boolean;

  constructor(args: LaunchRequestArguments) {
    this._workPath = args.cwd;
    this._name = args.projectName;
    this._platform = args.platform;
    this._compress = args.compress === true;
  }

  get nodeEnv(): string {
    return "development";
  }
  /**
   * 项目路径
   */
  get uniInputDir() {
    return this._workPath;
  }
  /**
   * dist `unpackage/dist/dev/mp-weixin`
   */
  get uniOutDir(): string {
    return path.join(
      this._workPath,
      "unpackage",
      "dist",
      "dev",
      this._platform
    );
  }
  /**
   * platform `mp-weixin,mp-qq,mp-baidu....`
   */
  get platform(): string {
    return this._platform;
  }
  /**
   * 是否运行时压缩
   */
  get compress(): boolean {
    return this._compress;
  }

  public env(): NodeJS.ProcessEnv {
    return {
      NODE_ENV: this.nodeEnv,
      UNI_INPUT_DIR: this.uniInputDir,
      UNI_OUTPUT_DIR: this.uniOutDir,
      UNI_PLATFORM: this.platform,
      UNI_MINIMIZE: this.compress + "",
    };
  }
}
