import { EventEmitter } from "events";
import { LaunchRequestArguments } from "./debugSession";
import * as childProcess from "child_process";
import { logger } from "@vscode/debugadapter";
import * as path from "path";
import { Config, OpenDevTools, SupportPlatform } from "../devtools";
import { WxDevtool } from "../devtools/wx";
import { BaiduDevtool } from "../devtools/baidu";

//cd /Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/ NODE_ENV=development UNI_INPUT_DIR=/Users/hb0730/development/wave/m3/wave-m3-wechat UNI_OUTPUT_DIR=/Users/hb0730/development/wave/m3/wave-m3-wechat/dist UNI_PLATFORM=mp-weixin  /Applications/HBuilderX.app/Contents/HBuilderX/plugins/node/node --max-old-space-size=2048 /Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/bin/uniapp-cli.js

export class DebugRuntime extends EventEmitter {
  private _uniappProcess?: childProcess.ChildProcess;
  private _project: Project;
  private _openDevtools: OpenDevTools;
  private _isOpen: boolean = false;
  private _isFishComplete: boolean = false;

  public set project(project: Project) {
    this._project = project;
  }
  public get project() {
    return this._project;
  }

  /**
   * 发送初始化请求
   */
  public async start(args: LaunchRequestArguments): Promise<void> {
    const _arg = new ArgsProject(args);
    logger.log("uniapp run start ............");
    logger.log(`HBuilderX node:  ${this._project.node}`);
    logger.log(`cwd: ${this._project.cwd}`);
    logger.log(`node env:  ${JSON.stringify(_arg.env())}`);
    const script = childProcess.spawn(
      this._project.node,
      ["--max-old-space-size=2048", "bin/uniapp-cli.js"],
      {
        cwd: this._project.cwd,
        env: _arg.env(),
      }
    );
    script.stdout.on("data", (data: Buffer) => {
      const content = data.toString();
      if (!this._isOpen) {
        this._isFishComplete = content.includes("Build complete");
        if (this._isFishComplete) {
          this.runDevTools(_arg);
          this._isOpen = true;
        }
      }
      this.sendEvent("stdout", data.toString());
    });
    script.stderr.on("data", (data: Buffer) => {
      this.sendEvent("stderr", data.toString());
    });
    script.on("exit", (code: number | null) => {
      this.sendEvent("exit", code ?? 0);
      this.sendEvent("end");
    });
    script.on("error", (error: Error) => {
      this.sendEvent("data", error.stack + "\n");
    });
    this._uniappProcess = script;
    // 启动开发者工具
    // this.runDevTools(_arg);
    // 控制台输出：在命令行中执行编译命令后，控制台会输出编译的进度和结果。当编译完成后，控制台会显示“Build complete.”的提示信息。
    // dist目录变化：在编译过程中，uniapp-cli会将编译结果输出到项目根目录下的dist目录中。因此，可以通过监视dist目录中文件的变化来判断编译是否完成。
  }
  /**
   * 通知Debugger停止运行
   */
  public async stopRun() {
    logger.log("uniapp run process stop ....");
    this._uniappProcess?.kill();
  }

  public sendEvent(event: string, ...args: any[]): void {
    setTimeout(() => {
      this.emit(event, ...args);
    }, 0);
  }
  private runDevTools(args: ArgsProject) {
    if (!args.openDevTool) {
      this.sendEvent("data", "skip open devTools \n");
      return;
    }
    const _platform: SupportPlatform = args.platform as SupportPlatform;
    let _config: Config = undefined;
    switch (_platform) {
      case SupportPlatform.weixin:
        _config = { devToolsPath: this._project.wxDevtoolPath };
        this._openDevtools = new WxDevtool(_config);
        break;
      case SupportPlatform.baidu:
        _config = { devToolsPath: this._project.baiduDevtoolPath };
        this._openDevtools = new BaiduDevtool(_config);
        break;
    }
    if (this._openDevtools) {
      this.sendEvent("data", `opening ${_platform} dev tools ..... \n`);
      this._openDevtools.exec(args.uniOutDir, this);
    }
  }
}

export class Project {
  private isWindows: boolean;

  /**
   * HBuilderX 安装路径
   *
   */
  private _localInstall: string;
  /**
   * 微信开发者工具安装路径
   */
  private _wxDevtoolPath: string;
  private _baiduDevtoolPath: string;

  constructor(isWindows: boolean, installLocalPath: string) {
    this.isWindows = isWindows;
    // 路径分割符问题
    this._localInstall = installLocalPath;
  }

  /**
   * 微信开发者工具路径
   */
  set wxDevtoolPath(wxDevtoolPath: string | undefined) {
    if (wxDevtoolPath) {
      this._wxDevtoolPath = wxDevtoolPath;
    }
  }
  get wxDevtoolPath(): string {
    return this._wxDevtoolPath;
  }
  /**
   * 百度开发者工具路径
   */
  set baiduDevtoolPath(baiduDevtoolPath: string) {
    this._baiduDevtoolPath = baiduDevtoolPath;
  }
  get baiduDevtoolPath(): string {
    return this._baiduDevtoolPath;
  }

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
  /**
   * 是否自动打开开发者工具
   */
  private _openDevTool: boolean;
  constructor(args: LaunchRequestArguments) {
    this._workPath = args.cwd;
    this._name = args.projectName;
    this._platform = args.platform;
    this._compress = args.compress === true;
    this._openDevTool = args["openDevTool"];
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
  /**
   * 是否自动打开开发者工具
   */
  get openDevTool(): boolean {
    return this._openDevTool;
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
